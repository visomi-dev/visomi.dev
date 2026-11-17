import { execFile, type ExecFileOptions } from 'node:child_process';
import { readFile } from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestCompose, runTestCompose, stopTestCompose } from './compose';
import type { TestCompose } from './compose';

vi.mock('node:child_process', () => ({ execFile: vi.fn() }));
vi.mock('./owned-command', () => ({
  runOwnedCommand: (command: string, args: string[], options: ExecFileOptions) =>
    new Promise((resolve, reject) => {
      execFile(command, args, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    }),
}));

const owner: TestCompose = {
  provider: 'docker',
  directory: '/synthetic/visomi-auth-test-owned',
  project: 'visomi-auth-test-owned',
  telemetryDirectory: '/synthetic/telemetry',
  app: 'web-api',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('VISOMI_TEST_COMPOSE', undefined);
  vi.mocked(execFile).mockImplementation(((...args: unknown[]) => {
    (args.at(-1) as (error: null, output: object) => void)(null, { stdout: '', stderr: '' });
  }) as never);
});

afterEach(() => vi.unstubAllEnvs());

describe('test Compose command ownership', () => {
  it.each(['docker', 'podman-compose'] as const)('honors the explicit %s provider', async (provider) => {
    vi.stubEnv('VISOMI_TEST_COMPOSE', provider);
    const resource = await createTestCompose(owner.directory, owner.telemetryDirectory, 'web-gateway');

    expect(resource).toEqual({
      ...owner,
      provider,
      app: 'web-gateway',
    });
    expect(execFile).not.toHaveBeenCalled();
  });

  it('detects Docker Compose without consulting a daemon or starting services', async () => {
    const resource = await createTestCompose(owner.directory, owner.telemetryDirectory, 'web-api');

    expect(resource.provider).toBe('docker');
    expect(execFile).toHaveBeenCalledWith('docker', ['compose', 'version'], { timeout: 5000 }, expect.any(Function));
  });

  it('uses podman-compose when Docker Compose is unavailable', async () => {
    vi.mocked(execFile).mockImplementationOnce(((...args: unknown[]) => {
      (args.at(-1) as (error: Error) => void)(new Error('synthetic_docker_unavailable'));
    }) as never);
    const resource = await createTestCompose(owner.directory, owner.telemetryDirectory, 'web-api');

    expect(resource.provider).toBe('podman-compose');
    expect(execFile).toHaveBeenLastCalledWith('podman-compose', ['version'], { timeout: 5000 }, expect.any(Function));
  });

  it('detects the Docker-to-Podman shim and avoids the external Docker Compose API compatibility bridge', async () => {
    vi.mocked(execFile).mockImplementationOnce(((...args: unknown[]) => {
      (args.at(-1) as (error: null, output: object) => void)(null, { stdout: 'podman version 5.4.2', stderr: '' });
    }) as never);
    const resource = await createTestCompose(owner.directory, owner.telemetryDirectory, 'web-api');

    expect(resource.provider).toBe('podman-compose');
    expect(execFile).not.toHaveBeenCalledWith(
      'docker',
      ['compose', 'version'],
      expect.anything(),
      expect.any(Function),
    );
  });

  it('rejects an unsupported provider instead of interpreting a shell command', async () => {
    vi.stubEnv('VISOMI_TEST_COMPOSE', 'synthetic; unsafe');

    await expect(createTestCompose(owner.directory, owner.telemetryDirectory, 'web-api')).rejects.toThrow(
      'test_compose_provider_invalid',
    );

    expect(execFile).not.toHaveBeenCalled();
  });

  it('allows a cold application build the full HTTP readiness window', async () => {
    await runTestCompose(owner, ['build', 'database-init', 'app']);

    expect(execFile).toHaveBeenCalledWith(
      'docker',
      expect.arrayContaining(['build', 'database-init', 'app']),
      expect.objectContaining({ timeout: 600000 }),
      expect.any(Function),
    );
  });

  it.each([
    ['true pasta', 'pasta'],
    ['true slirp4netns', 'slirp4netns'],
    ['false pasta', undefined],
    ['unknown', undefined],
  ])('uses a private user-mode network only for supported host-only Podman fixtures: %s', async (info, expected) => {
    vi.stubEnv('VISOMI_TEST_COMPOSE', 'podman-compose');
    vi.mocked(execFile).mockImplementationOnce(((...args: unknown[]) => {
      (args.at(-1) as (error: null, result: object) => void)(null, { stdout: info });
    }) as never);

    const result = await createTestCompose(owner.directory, owner.telemetryDirectory, 'postgres');

    expect(result.hostNetwork).toBe(expected);
    expect(result.app).toBe('web-api');
  });

  it('falls back to Compose when the host network driver cannot be determined', async () => {
    vi.stubEnv('VISOMI_TEST_COMPOSE', 'podman-compose');
    vi.mocked(execFile).mockImplementationOnce(((...args: unknown[]) => {
      (args.at(-1) as (error: Error) => void)(new Error('info unavailable'));
    }) as never);

    const result = await createTestCompose(owner.directory, owner.telemetryDirectory, 'postgres');

    expect(result.hostNetwork).toBeUndefined();
  });

  it('starts and removes only the host-only PostgreSQL container using the Compose image pin', async () => {
    const host = { ...owner, provider: 'podman-compose', hostNetwork: 'pasta' } as const;
    const signal = new AbortController().signal;

    await runTestCompose(host, ['up', '-d', 'postgres'], signal);

    const args = vi.mocked(execFile).mock.calls[0][1] as string[];
    const compose = await readFile(new URL('../../../../../compose.yaml', import.meta.url), 'utf8');

    expect(compose).toContain('postgres:\n    image: ' + args.at(-1) + '\n');
    expect(args).toEqual(
      expect.arrayContaining([
        '--network',
        'pasta',
        '--publish',
        '127.0.0.1::5432',
        '--tmpfs',
        '/var/lib/postgresql/data:size=256m',
        '--label',
        'io.podman.compose.project=' + host.project,
      ]),
    );

    expect(() => runTestCompose(host, ['up', '-d', 'app'], signal)).toThrow('isolated_postgres_host_command_invalid');

    await runTestCompose(host, ['port', 'postgres', '5432'], signal);

    expect(vi.mocked(execFile).mock.calls[1][1]).toEqual(['port', host.project + '-postgres', '5432/tcp']);

    await stopTestCompose(host, signal);

    expect(execFile).toHaveBeenCalledTimes(3);
    expect(vi.mocked(execFile).mock.calls[2][1]).toEqual([
      'rm',
      '--force',
      '--time',
      '2',
      '--volumes',
      '--filter',
      'label=io.podman.compose.project=' + host.project,
    ]);
  });

  it.each(['web-api', 'web-gateway'] as const)('isolates %s from ambient development settings', async (app) => {
    vi.stubEnv('APP_DATABASE_URL', 'postgresql://synthetic-development/never-use');
    vi.stubEnv('POSTGRES_DB', 'synthetic-development');
    vi.stubEnv('HOST_BINDING', '0.0.0.0:');
    vi.stubEnv('REDIS_PORT', '6379');

    await runTestCompose({ ...owner, app }, ['up', '-d', '--build', 'app']);

    const [command, args, options] = vi.mocked(execFile).mock.calls[0] as unknown as [
      string,
      string[],
      { env: Record<string, string>; timeout: number },
    ];

    expect(command).toBe('docker');
    expect(options.timeout).toBe(300000);
    expect(args).toEqual(
      expect.arrayContaining([
        'compose',
        '--env-file',
        owner.directory + '/compose.env',
        '-p',
        owner.project,
        'up',
        '-d',
        '--build',
        'app',
      ]),
    );
    expect(options.env).toMatchObject({
      APP_NAME: app,
      VISOMI_TEST_APP_ROOT: app === 'web-api' ? 'apps/web/api' : 'apps/web/gateway',
      APP_PORT: app === 'web-api' ? '3307' : '3317',
      POSTGRES_DB: 'visomi_auth_test',
      POSTGRES_PORT: '',
      REDIS_PORT: '',
      HOST_BINDING: '127.0.0.1:',
      APP_DATABASE_URL: 'postgresql://visomi_test:synthetic-test-password@postgres:5432/visomi_auth_test',
      VISOMI_TEST_TELEMETRY_DIR: owner.telemetryDirectory,
    });
  });

  it('invokes the Podman provider directly with the same owned project', async () => {
    await runTestCompose({ ...owner, provider: 'podman-compose' }, ['down', '--volumes']);

    const [command, args] = vi.mocked(execFile).mock.calls[0];

    expect(execFile).toHaveBeenCalledWith(
      'podman-compose',
      expect.any(Array),
      expect.objectContaining({ timeout: 20000 }),
      expect.any(Function),
    );
    expect(command).toBe('podman-compose');
    expect(args).not.toContain('compose');
    expect(args?.[0]).toBe('--in-pod=false');
    expect(args).toEqual(expect.arrayContaining(['-p', owner.project, 'down', '--volumes']));
  });

  it('keeps an allocated Redis binding stable instead of using an ambient development port', async () => {
    vi.stubEnv('REDIS_PORT', '6379');

    await runTestCompose({ ...owner, redisPort: 46479 }, ['up', '-d', 'redis']);

    expect(execFile).toHaveBeenCalledWith(
      'docker',
      expect.any(Array),
      expect.objectContaining({ env: expect.objectContaining({ REDIS_PORT: '46479' }) }),
      expect.any(Function),
    );
  });

  it.each([
    ['postgres', '5432'],
    ['redis', '6379'],
  ])('reads the owned Podman %s binding without inspecting the full container', async (service, port) => {
    const signal = new AbortController().signal;

    await runTestCompose({ ...owner, provider: 'podman-compose' }, ['port', service, port], signal);

    expect(execFile).toHaveBeenCalledExactlyOnceWith(
      'podman',
      ['port', `${owner.project}-${service}`, `${port}/tcp`],
      expect.objectContaining({ signal, timeout: 40000 }),
      expect.any(Function),
    );
  });

  it.each([
    { directory: '/synthetic/developer-data' },
    { project: 'visomi-local' },
    { provider: 'synthetic-command' },
    { app: 'synthetic-app' },
    { app: 'api' },
    { app: 'gateway' },
    { hostNetwork: 'pasta' },
    { provider: 'podman-compose', hostNetwork: 'other' },
    { redisPort: 0 },
    { redisPort: 65536 },
    { redisPort: 1.5 },
  ])('refuses an unowned or unsupported descriptor: %j', (change) => {
    expect(() => runTestCompose({ ...owner, ...change } as TestCompose, ['down', '--volumes'])).toThrow(
      'isolated_compose_owner_invalid',
    );
    expect(execFile).not.toHaveBeenCalled();
  });
});

describe('owned Compose teardown', () => {
  it('keeps Docker cleanup in the owned Compose project', async () => {
    const signal = new AbortController().signal;

    await stopTestCompose(owner, signal);

    expect(execFile).toHaveBeenCalledWith(
      'docker',
      expect.arrayContaining([
        'compose',
        '-p',
        owner.project,
        'down',
        '--timeout',
        '2',
        '--volumes',
        '--remove-orphans',
      ]),
      expect.objectContaining({ signal }),
      expect.any(Function),
    );
  });

  it.each([true, false])(
    'removes only the exact Podman project without global prune scans; present=%s',
    async (present) => {
      const signal = new AbortController().signal;

      vi.mocked(execFile).mockImplementation(((
        _command: string,
        args: string[],
        _options: unknown,
        callback: (error: null, stdout: string, stderr: string) => void,
      ) => callback(null, present && args[1] === 'ls' ? `owned-${args[0]}\n` : '', '')) as never);

      await stopTestCompose({ ...owner, provider: 'podman-compose' }, signal);

      const calls = vi.mocked(execFile).mock.calls;
      const filter = ['--filter', 'label=io.podman.compose.project=' + owner.project];

      expect(calls.map((call) => call[1])).toEqual([
        ['rm', '--force', '--time', '2', '--volumes', ...filter],
        ['volume', 'ls', ...filter, '--quiet'],
        ...(present ? [['volume', 'rm', 'owned-volume']] : []),
        ['network', 'ls', ...filter, '--quiet'],
        ...(present ? [['network', 'rm', 'owned-network']] : []),
      ]);
      for (const call of calls) {
        expect(call[0]).toBe('podman');
        expect(call[1]).not.toContain('--all');
        expect(call[1]).not.toContain('prune');
        expect(call[2]).toMatchObject({ signal, timeout: 45000 });
      }
    },
  );

  it('rejects an unowned cleanup descriptor before invoking Podman', async () => {
    await expect(stopTestCompose({ ...owner, project: 'unrelated' }, new AbortController().signal)).rejects.toThrow(
      'isolated_compose_owner_invalid',
    );

    expect(execFile).not.toHaveBeenCalled();
  });
});
