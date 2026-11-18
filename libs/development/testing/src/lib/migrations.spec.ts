import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { Pool } from 'pg';
import { expect, it } from 'vitest';

import { runTestCompose } from './compose';
import { testPostgres } from './postgres';

const execute = promisify(execFile);
const script = fileURLToPath(new URL('../../../../../libs/backend/shared/tools/database/migrate.mjs', import.meta.url));

it('applies the production migration command to an empty isolated database and can repeat it', async () => {
  const database = await testPostgres();
  const pool = new Pool({ connectionString: database.url });

  try {
    const settings = await pool.query<{ data_directory: string }>('SHOW data_directory');
    const dataDirectory = settings.rows[0].data_directory;
    const storage = await runTestCompose(database.compose, [
      'exec',
      '-T',
      'postgres',
      'stat',
      '-f',
      '-c',
      '%T',
      dataDirectory,
    ]);

    expect(storage.stdout.trim()).toBe('tmpfs');

    // This fixture owns an isolated disposable database, never the developer's DATABASE_URL.
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; DROP SCHEMA drizzle CASCADE;');

    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await execute(process.execPath, [script], { env: { ...process.env, DATABASE_URL: database.url } });

      expect(result.stderr).toBe('');
      const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");

      expect(tables.rows.map((row) => row.tablename)).toEqual(
        expect.arrayContaining(['auth_users', 'auth_sessions', 'auth_credentials', 'auth_flows', 'site_visit_days']),
      );
      const history = await pool.query('SELECT * FROM drizzle.__drizzle_migrations');

      expect(history.rows).toHaveLength(6);
    }
  } finally {
    await pool.end();

    await database.stop();

    expect(Object.values(database.timings).every((value) => value >= 0 && value < 60000)).toBe(true);
    process.stdout.write(JSON.stringify({ fixture: 'isolated-migrations', phases: database.timings }) + '\n');
  }
}, 100000);

it('starts independent databases concurrently and cleanup preserves the other fixture', async () => {
  const databases: Awaited<ReturnType<typeof testPostgres>>[] = [];
  const pools: Pool[] = [];

  try {
    const results = await Promise.allSettled(
      [0, 1].map(async () => {
        const database = await testPostgres();

        databases.push(database);
      }),
    );

    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'fulfilled']);
    expect(new Set(databases.map((database) => database.url)).size).toBe(2);
    for (const [index, database] of databases.entries()) {
      const pool = new Pool({ connectionString: database.url });

      pools.push(pool);

      await pool.query('CREATE TABLE fixture_probe (id integer PRIMARY KEY, value text);');

      await pool.query('INSERT INTO fixture_probe VALUES (1, $1)', [`synthetic-${index}`]);

      if (database.compose.provider === 'podman-compose') {
        await expect(
          execute('podman', ['pod', 'exists', `pod_${database.compose.project}`], { timeout: 10000 }),
        ).rejects.toMatchObject({ code: 1 });
      }
    }

    await pools[0].end();

    pools.shift();

    await databases[0].stop();

    const remaining = await pools[0].query('SELECT value FROM fixture_probe WHERE id = 1');

    expect(remaining.rows).toEqual([{ value: 'synthetic-1' }]);
  } finally {
    await Promise.all(pools.map((pool) => pool.end()));

    const cleanup = await Promise.allSettled(databases.map((database) => database.stop()));

    expect(cleanup.map((result) => result.status)).toEqual(databases.map(() => 'fulfilled'));
  }
}, 100000);

it('fails with a controlled message when configuration is absent or unreachable', async () => {
  for (const url of ['', 'postgresql://synthetic:synthetic-private-password@127.0.0.1:1/unused']) {
    await expect(
      execute(process.execPath, [script], { env: { ...process.env, DATABASE_URL: url } }),
    ).rejects.toMatchObject({ code: 1, stdout: '', stderr: 'database_migration_failed\n' });
  }
});
