import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

import { Pool } from 'pg';

import { migrateContacts, parseContactExport, rollbackContacts } from './migration';

async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      input: { type: 'string' },
      batch: { type: 'string' },
      backup: { type: 'string' },
      apply: { type: 'boolean', default: false },
      rollback: { type: 'boolean', default: false },
    },
  });

  if (!values.batch || !process.env['DATABASE_URL']) {
    throw new Error('contact_configuration_invalid');
  }

  if (values.rollback && (!values.apply || !values.backup)) {
    throw new Error('contact_rollback_requires_apply_and_backup');
  }

  const pool = new Pool({ connectionString: process.env['DATABASE_URL'], max: 1, connectionTimeoutMillis: 3000 });

  try {
    if (values.rollback) {
      const report = await rollbackContacts(pool, values.batch, values.backup!);

      process.stdout.write(JSON.stringify(report) + '\n');

      return;
    }

    if (!values.input) {
      throw new Error('contact_input_required');
    }

    const awaitedResult1 = await readFile(values.input, 'utf8');
    const input: unknown = JSON.parse(awaitedResult1);
    const report = await migrateContacts(pool, parseContactExport(input), {
      apply: values.apply,
      backupPath: values.backup,
      batch: values.batch,
    });

    process.stdout.write(JSON.stringify(report) + '\n');
  } finally {
    await pool.end();
  }
}

void run().catch(() => {
  process.stderr.write('contact_migration_failed\n');
  process.exitCode = 1;
});
