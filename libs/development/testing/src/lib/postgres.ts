import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

import { createTestCompose, runTestCompose, stopTestCompose, TEST_POSTGRES_CLEANUP_MS } from './compose';
import type { TestCompose } from './compose';

// Every resource has its own Compose project/volume; developer DATABASE_URL is never consulted.
export async function testPostgres(
  manifest?: string,
  target: TestCompose['app'] | 'postgres' = 'web-api',
  cancellation?: AbortSignal,
) {
  const deadline = AbortSignal.timeout(40000);
  const signal = cancellation ? AbortSignal.any([cancellation, deadline]) : deadline;
  const timings = { setupMs: 0, readinessMs: 0, migrationMs: 0, cleanupMs: 0 };
  const started = performance.now();
  const temporaryRoot = manifest ? dirname(manifest) : tmpdir();
  const directory = await mkdtemp(join(temporaryRoot, 'visomi-auth-test-'));
  let compose: TestCompose | undefined;
  let phase = 'provider';

  try {
    await writeFile(join(directory, 'test-owner'), 'visomi-stack-isolated-postgres');

    await writeFile(join(directory, 'compose.env'), '');

    const created = await createTestCompose(directory, temporaryRoot, target);

    compose = created;

    if (manifest) {
      await writeFile(manifest, JSON.stringify({ directory, compose }));
    }

    phase = 'start';

    await runTestCompose(compose, ['up', '-d', 'postgres'], signal);

    phase = 'port';
    const { stdout } = await runTestCompose(compose, ['port', 'postgres', '5432'], signal);
    // Both providers must report a loopback binding for this fixture.
    const match = /^127\.0\.0\.1:(\d+)$/.exec(stdout.trim());

    if (!match || Number(match[1]) < 1 || Number(match[1]) > 65535) {
      throw new Error('test_postgres_port_unavailable');
    }

    timings.setupMs = performance.now() - started;
    const readyStarted = performance.now();
    const url = `postgresql://visomi_test:synthetic-test-password@127.0.0.1:${match[1]}/visomi_auth_test`;
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 1000, query_timeout: 5000, max: 1 });
    const db = drizzle({ client: pool, logger: false });

    try {
      phase = 'readiness';
      for (;;) {
        signal.throwIfAborted();

        try {
          await pool.query('SELECT 1');

          break;
        } catch {
          // Fast refusals must not exhaust readiness before the setup deadline.
          signal.throwIfAborted();

          await delay(100, undefined, { signal });
        }
      }

      signal.throwIfAborted();
      timings.readinessMs = performance.now() - readyStarted;
      const migrationStarted = performance.now();

      phase = 'migration';

      await migrate(db, {
        migrationsFolder: resolve(__dirname, '../../../../../libs/backend/shared/src/lib/database/migrations'),
      });

      signal.throwIfAborted();
      timings.migrationMs = performance.now() - migrationStarted;
    } finally {
      await pool.end();
    }

    let stopping: Promise<void> | undefined;
    const owner = compose;
    const stop = () =>
      (stopping ??= (async () => {
        const cleanupStarted = performance.now();

        await stopTestPostgres(directory, owner);

        timings.cleanupMs = performance.now() - cleanupStarted;
      })());

    return { url, directory, compose, stop, timings };
  } catch {
    const reason = deadline.aborted ? ':timeout' : signal.aborted ? ':cancelled' : '';

    if (compose) {
      await stopTestPostgres(directory, compose);
    } else {
      await rm(directory, { recursive: true, force: true });
    }

    throw new Error(`isolated_postgres_setup_failed:${phase}${reason}`);
  }
}

export async function stopTestPostgres(
  directory: string,
  compose: TestCompose,
  signal: AbortSignal = AbortSignal.timeout(TEST_POSTGRES_CLEANUP_MS),
) {
  if (!basename(directory).startsWith('visomi-auth-test-') || compose.directory !== directory) {
    throw new Error('isolated_postgres_owner_invalid');
  }

  try {
    const marker = await readFile(join(directory, 'test-owner'), 'utf8');

    if (marker !== 'visomi-stack-isolated-postgres') {
      throw new Error('isolated_postgres_owner_invalid');
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }

    throw error;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await stopTestCompose(compose, signal);

      break;
    } catch (error) {
      if (attempt === 0 && !signal.aborted) {
        continue;
      }

      const failure = error as { message?: string };
      const reason =
        [
          'isolated_command_timeout',
          'isolated_command_aborted',
          'isolated_command_failed',
          'isolated_command_output_limit',
        ].find((code) => code === failure.message) ?? 'provider_error';

      // The marker survives exhausted cleanup, and raw command output never enters the error.
      // eslint-disable-next-line preserve-caught-error -- Retain only a fixed code.
      throw new Error(`isolated_postgres_cleanup_failed:${reason}`);
    }
  }

  await rm(directory, { recursive: true, force: true });
}
