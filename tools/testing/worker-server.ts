import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { workspaceRoot } from '@nx/devkit';
import { chromium } from '@playwright/test';
import { runTestCompose } from '@visomi-stack/dev-testing/lib/compose';
import { runFixture } from '@visomi-stack/dev-testing/lib/fixture-lifetime';
import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';

async function main() {
  await runFixture(async ({ signal, onCleanup, stop }) => {
    const root = resolve(workspaceRoot, 'tmp/worker-fixture');
    const resources: { database?: Awaited<ReturnType<typeof testPostgres>>; child?: ReturnType<typeof spawn> } = {};
    const postgresRoot = await mkdtemp(resolve(tmpdir(), 'visomi-worker-test-'));

    onCleanup(async () => {
      const child = resources.child;

      if (child && child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');

        child.kill('SIGTERM');

        await Promise.race([exited, delay(10000, undefined, { ref: false })]);

        if (child.exitCode === null && child.signalCode === null) {
          child.kill('SIGKILL');

          await exited;
        }
      }

      try {
        await resources.database?.stop();

        const entries = await readdir(postgresRoot, { withFileTypes: true });

        // A retained project directory means setup cleanup failed. Keep its manifest for recovery.
        if (!entries.some((entry) => entry.isDirectory())) {
          await rm(postgresRoot, { recursive: true, force: true });
        }
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });

    await mkdir(root, { recursive: true });

    signal.throwIfAborted();

    const database = await testPostgres(
      resolve(postgresRoot, 'postgres.json'),
      'web-api',
      AbortSignal.any([signal, AbortSignal.timeout(40000)]),
    );

    resources.database = database;
    signal.throwIfAborted();

    await runTestCompose(database.compose, ['up', '-d', 'redis'], signal);

    const binding = await runTestCompose(database.compose, ['port', 'redis', '6379'], signal);
    const port = /^(?:127\.0\.0\.1:)?(\d+)$/.exec(binding.stdout.trim())?.[1];

    if (!port) {
      throw new Error('isolated_redis_port_invalid');
    }

    // Docker reallocates anonymous published ports on start; make this owned binding explicit first.
    database.compose.redisPort = Number(port);

    await runTestCompose(database.compose, ['up', '-d', '--force-recreate', 'redis'], signal);

    const redisUrl = `redis://127.0.0.1:${port}`;

    await mkdir(resolve(root, 'apps/web/site/public'), { recursive: true });

    await mkdir(resolve(root, 'dist/apps/web/site/client'), { recursive: true });

    await writeFile(resolve(root, 'fixture.json'), JSON.stringify({ redisUrl, compose: database.compose }), {
      mode: 0o600,
    });

    signal.throwIfAborted();

    const child = spawn(process.execPath, [resolve(workspaceRoot, 'dist/apps/web/gateway/main.js')], {
      cwd: root,
      env: {
        PATH: process.env.PATH,
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: '8187',
        WORKSPACE_ROOT: root,
        REDIS_URL: redisUrl,
        PUPPETEER_EXECUTABLE_PATH: chromium.executablePath(),
        SOCIAL_IMAGE_INTERNAL_TOKEN: 'synthetic-internal-social-image-token-32-bytes',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    resources.child = child;
    child.once('exit', () => {
      if (!signal.aborted) {
        process.exitCode = 1;
        stop();
      }
    });
    child.stdout?.on('data', () => {
      /* Consume runtime output without retaining payloads. */
    });
    child.stderr?.on('data', () => {
      /* Errors are asserted through HTTP and queue state. */
    });
    for (let attempt = 0; attempt < 200; attempt++) {
      signal.throwIfAborted();

      try {
        const response = await fetch('http://127.0.0.1:8187/api/health', {
          signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]),
        });

        if (response.ok) {
          break;
        }
      } catch {
        /* The owned process is still starting. */
      }

      if (child.exitCode !== null || attempt === 199) {
        throw new Error('worker_fixture_startup_failed');
      }

      await delay(100, undefined, { signal });
    }
  });
}
void main().catch(() => {
  console.error('worker_fixture_failed');
  process.exitCode = 1;
});
