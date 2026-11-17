import { execFile } from 'node:child_process';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';

import { workspaceRoot } from '@nx/devkit';

import { runOwnedCommand } from './owned-command';

const execute = promisify(execFile);

export const TEST_POSTGRES_CLEANUP_MS = 45000;

export type TestCompose = {
  provider: 'docker' | 'podman-compose';
  project: string;
  directory: string;
  telemetryDirectory: string;
  app: 'web-api' | 'web-gateway';
  redisPort?: number;
  hostNetwork?: 'pasta' | 'slirp4netns';
};

export async function createTestCompose(
  directory: string,
  telemetryDirectory: string,
  target: TestCompose['app'] | 'postgres',
): Promise<TestCompose> {
  const configured = process.env['VISOMI_TEST_COMPOSE'];
  let provider: TestCompose['provider'];

  if (configured === 'docker' || configured === 'podman-compose') {
    provider = configured;
  } else if (configured) {
    throw new Error('test_compose_provider_invalid');
  } else {
    try {
      const version = await execute('docker', ['--version'], { timeout: 5000 });

      if (/podman version/i.test(version.stdout)) {
        await execute('podman-compose', ['version'], { timeout: 5000 });

        provider = 'podman-compose';
      } else {
        await execute('docker', ['compose', 'version'], { timeout: 5000 });

        provider = 'docker';
      }
    } catch {
      await execute('podman-compose', ['version'], { timeout: 5000 });

      provider = 'podman-compose';
    }
  }

  const owner: TestCompose = {
    provider,
    project: basename(directory).toLowerCase(),
    directory,
    telemetryDirectory,
    app: target === 'postgres' ? 'web-api' : target,
  };

  if (target === 'postgres' && provider === 'podman-compose') {
    try {
      const { stdout } = await execute(
        'podman',
        ['info', '--format', '{{.Host.Security.Rootless}} {{.Host.RootlessNetworkCmd}}'],
        { timeout: 5000 },
      );

      if (stdout.trim() === 'true pasta') {
        owner.hostNetwork = 'pasta';
      }

      if (stdout.trim() === 'true slirp4netns') {
        owner.hostNetwork = 'slirp4netns';
      }
    } catch {
      // Older engines can still use the isolated Compose network.
    }
  }

  return owner;
}

export function runTestCompose(
  owner: TestCompose,
  args: string[],
  signal?: AbortSignal,
): Promise<{ stdout: string; stderr: string }> {
  validateOwner(owner);

  const [action, service, port] = args;

  if (owner.hostNetwork && args.join(' ') === 'up -d postgres') {
    // A host-only client needs a loopback port, not a shared Compose network or named volume.
    return runOwnedCommand(
      'podman',
      [
        'run',
        '--detach',
        '--network',
        owner.hostNetwork,
        '--name',
        `${owner.project}-postgres`,
        '--label',
        `io.podman.compose.project=${owner.project}`,
        '--publish',
        '127.0.0.1::5432',
        '--tmpfs',
        '/var/lib/postgresql/data:size=256m',
        '--env',
        'POSTGRES_DB=visomi_auth_test',
        '--env',
        'POSTGRES_USER=visomi_test',
        '--env',
        'POSTGRES_PASSWORD=synthetic-test-password',
        'docker.io/library/postgres:16-alpine',
      ],
      { signal, timeout: 40000, maxBuffer: 1024 * 1024 },
    );
  }

  if (owner.hostNetwork && args.join(' ') !== 'port postgres 5432') {
    throw new Error('isolated_postgres_host_command_invalid');
  }

  if (owner.provider === 'podman-compose' && action === 'port' && (service === 'postgres' || service === 'redis')) {
    // The test override names these containers explicitly. Query only their port mappings.
    return runOwnedCommand('podman', ['port', `${owner.project}-${service}`, `${port}/tcp`], {
      signal,
      timeout: 40000,
      maxBuffer: 1024,
    });
  }

  return runOwnedCommand(
    owner.provider,
    [
      // Compose services already have their own network; an extra Podman pod is unlabelled and unnecessary.
      ...(owner.provider === 'docker' ? ['compose'] : ['--in-pod=false']),
      '--env-file',
      join(owner.directory, 'compose.env'),
      '-f',
      join(workspaceRoot, 'compose.yaml'),
      '-f',
      join(workspaceRoot, 'compose.test.yaml'),
      '-p',
      owner.project,
      ...args,
    ],
    {
      cwd: workspaceRoot,
      signal,
      // Match the HTTP readiness window for cold builds; keep routine Compose commands bounded.
      timeout: args[0] === 'build' ? 600000 : args[0] === 'down' ? 20000 : 300000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        // Override ambient development settings; Compose must only reach this owned test database.
        COMPOSE_PROJECT_NAME: owner.project,
        APP_NAME: owner.app,
        VISOMI_TEST_APP_ROOT: owner.app === 'web-api' ? 'apps/web/api' : 'apps/web/gateway',
        APP_PORT: owner.app === 'web-api' ? '3307' : '3317',
        APP_DATABASE_URL: 'postgresql://visomi_test:synthetic-test-password@postgres:5432/visomi_auth_test',
        POSTGRES_DB: 'visomi_auth_test',
        POSTGRES_USER: 'visomi_test',
        POSTGRES_PASSWORD: 'synthetic-test-password',
        POSTGRES_PORT: '',
        REDIS_PORT: owner.redisPort?.toString() ?? '',
        DISABLE_WORKER: 'true',
        OWNER_EMAIL: 'owner@example.test',
        HOST_BINDING: '127.0.0.1:',
        AUTH_ORIGIN: owner.app === 'web-api' ? 'http://127.0.0.1:3307' : 'http://127.0.0.1:3317',
        AUTH_RP_ID: '127.0.0.1',
        SESSION_SECRET: 'synthetic-e2e-only-session-secret-32-bytes',
        VISOMI_TEST_TELEMETRY_DIR: owner.telemetryDirectory,
        HEALTHCHECK_INTERVAL: '1s',
        HEALTHCHECK_START_PERIOD: '1s',
      },
    },
  );
}

function validateOwner(owner: TestCompose): void {
  if (
    !basename(owner.directory).startsWith('visomi-auth-test-') ||
    owner.project !== basename(owner.directory).toLowerCase() ||
    !['docker', 'podman-compose'].includes(owner.provider) ||
    !['web-api', 'web-gateway'].includes(owner.app) ||
    (owner.hostNetwork !== undefined &&
      (owner.provider !== 'podman-compose' || !['pasta', 'slirp4netns'].includes(owner.hostNetwork))) ||
    (owner.redisPort !== undefined &&
      (!Number.isInteger(owner.redisPort) || owner.redisPort < 1 || owner.redisPort > 65535))
  ) {
    throw new Error('isolated_compose_owner_invalid');
  }
}

export async function stopTestCompose(owner: TestCompose, signal: AbortSignal): Promise<void> {
  validateOwner(owner);

  if (owner.provider === 'docker') {
    await runTestCompose(owner, ['down', '--timeout', '2', '--volumes', '--remove-orphans'], signal);

    return;
  }

  // Containers are selected at deletion time by the exact randomly generated project label.
  const command = (args: string[]) =>
    runOwnedCommand('podman', args, { signal, timeout: TEST_POSTGRES_CLEANUP_MS, maxBuffer: 1024 * 1024 });
  const label = `label=io.podman.compose.project=${owner.project}`;

  await command(['rm', '--force', '--time', '2', '--volumes', '--filter', label]);

  if (owner.hostNetwork) {
    return;
  }

  // Podman's prune scans containers globally even with a label filter, and races other
  // projects' teardown. List only owned resources and delete those explicit names instead.
  for (const resource of ['volume', 'network']) {
    const { stdout } = await command([resource, 'ls', '--filter', label, '--quiet']);
    const names = stdout.trim().split(/\s+/).filter(Boolean);

    if (names.length > 0) {
      await command([resource, 'rm', ...names]);
    }
  }
}
