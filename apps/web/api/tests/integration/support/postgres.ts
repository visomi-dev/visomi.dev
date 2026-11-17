import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Pool } from 'pg';
import { inject } from 'vitest';
import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Vitest merges this interface.
  interface ProvidedContext {
    postgresRunDirectory: string;
  }
}

async function templateUrl(): Promise<string> {
  // Vitest reuses a slot across files, but never assigns it to two workers at once.
  const poolId = process.env['VITEST_POOL_ID'];

  if (!poolId || !/^\d+$/.test(poolId)) {
    throw new Error('postgres_fixture_slot_required');
  }

  const slot = join(inject('postgresRunDirectory'), poolId);
  const ready = join(slot, 'template-url');

  try {
    await mkdir(slot);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }

    return readFile(ready, 'utf8');
  }

  const template = await testPostgres(join(slot, 'postgres.json'));

  await writeFile(ready, template.url, { mode: 0o600 });

  return template.url;
}

let templateReady: Promise<string> | undefined;

export async function suitePostgres() {
  templateReady ??= templateUrl();
  const connection = await templateReady;
  const url = new URL(connection);
  const template = url.pathname.slice(1);
  const name = 'suite_' + randomUUID().replaceAll('-', '');

  url.pathname = '/postgres';
  const admin = new Pool({ connectionString: url.href, max: 1, connectionTimeoutMillis: 1000, query_timeout: 5000 });

  try {
    await admin.query(`CREATE DATABASE "${name}" TEMPLATE "${template}"`);
  } catch (error) {
    await admin.end();

    throw error;
  }

  url.pathname = '/' + name;

  return {
    url: url.href,
    async stop() {
      try {
        await admin.query(`DROP DATABASE "${name}"`);
      } finally {
        await admin.end();
      }
    },
  };
}
