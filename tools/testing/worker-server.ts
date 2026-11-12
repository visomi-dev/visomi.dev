import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { workspaceRoot } from '@nx/devkit';
import { chromium } from '@playwright/test';
import { runTestCompose } from '@visomi-stack/dev-testing/lib/compose';
import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';

async function main() {
  const root = resolve(workspaceRoot, 'tmp/worker-fixture');

  await mkdir(root, { recursive: true });

  const database = await testPostgres(resolve(root, 'postgres.json'));
  let child: ReturnType<typeof spawn> | undefined;
  let stopping = false;

  async function stop() {
    if (stopping) {
      return;
    }

    stopping = true;

    if (child && child.exitCode === null) {
      const exit = once(child, 'exit');

      child.kill('SIGTERM');

      await exit;
    }

    await database.stop();

    await rm(root, { recursive: true, force: true });
  }
  process.on('SIGTERM', () => void stop());
  process.on('SIGINT', () => void stop());

  try {
    await runTestCompose(database.compose, ['up', '-d', 'redis']);

    const binding = await runTestCompose(database.compose, ['port', 'redis', '6379']);
    const port = /(?:127\.0\.0\.1:)?(\d+)\s*$/.exec(binding.stdout)?.[1];

    if (!port) {
      throw new Error('isolated_redis_port_invalid');
    }

    // Docker reallocates anonymous published ports on start; make this owned binding explicit first.
    database.compose.redisPort = Number(port);

    await runTestCompose(database.compose, ['up', '-d', '--force-recreate', 'redis']);

    const redisUrl = `redis://127.0.0.1:${port}`;

    await mkdir(resolve(root, 'apps/web/site/public'), { recursive: true });

    await mkdir(resolve(root, 'dist/apps/web/site/client'), { recursive: true });

    await writeFile(resolve(root, 'fixture.json'), JSON.stringify({ redisUrl, compose: database.compose }), {
      mode: 0o600,
    });

    child = spawn(process.execPath, [resolve(workspaceRoot, 'dist/apps/web/gateway/main.js')], {
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
    child.stdout?.on('data', () => {
      /* Consume runtime output without retaining payloads. */
    });
    child.stderr?.on('data', () => {
      /* Errors are asserted through HTTP and queue state. */
    });
    for (let attempt = 0; attempt < 200; attempt++) {
      try {
        const response = await fetch('http://127.0.0.1:8187/api/health');

        if (response.ok) {
          break;
        }
      } catch {
        /* The owned process is still starting. */
      }

      if (child.exitCode !== null || attempt === 199) {
        throw new Error('worker_fixture_startup_failed');
      }

      await delay(100);
    }

    await once(child, 'exit');
  } finally {
    await stop();
  }
}
void main().catch(() => {
  console.error('worker_fixture_failed');
  process.exitCode = 1;
});
