import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { createClient } from '@libsql/client';

import { parseContactRecovery, restoreLegacyContacts } from '../../src/contact/legacy-restore';

async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      input: { type: 'string' },
      backup: { type: 'string' },
      apply: { type: 'boolean', default: false },
      'writes-frozen': { type: 'boolean', default: false },
    },
  });
  const url = process.env['CONTACT_LEGACY_DATABASE_URL'];

  if (!url || !values.input) {
    throw new Error('contact_legacy_configuration_invalid');
  }

  const address = new URL(url);

  if (!['file:', 'libsql:', 'https:', 'wss:'].includes(address.protocol)) {
    throw new Error('contact_legacy_configuration_invalid');
  }

  if (address.protocol === 'file:') {
    // Opening a missing SQLite file would create it even in a dry-run.
    if (!/^file:\//i.test(url)) {
      throw new Error('contact_legacy_configuration_invalid');
    }

    const target = await stat(fileURLToPath(address));

    if (!target.isFile()) {
      throw new Error('contact_legacy_configuration_invalid');
    }
  }

  const file = await readFile(values.input, 'utf8');
  const input: unknown = JSON.parse(file);
  const rows = parseContactRecovery(input);
  const client = createClient({ url, authToken: process.env['CONTACT_LEGACY_DATABASE_AUTH_TOKEN'], intMode: 'bigint' });

  try {
    const report = await restoreLegacyContacts(client, rows, {
      apply: values.apply,
      writesFrozen: values['writes-frozen'],
      backupPath: values.backup,
    });

    process.stdout.write(JSON.stringify(report) + '\n');
  } finally {
    client.close();
  }
}

void run().catch(() => {
  process.stderr.write('contact_legacy_restore_failed\n');
  process.exitCode = 1;
});
