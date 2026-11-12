import { writeFile } from 'node:fs/promises';

import type { Client, Transaction } from '@libsql/client';
import { z } from 'zod';

import { digest, parseContactExport } from './migration';
import type { ContactSubmission } from './repository';

const recovery = z
  .object({ version: z.literal(1), batch: z.string().regex(/^[a-z0-9-]{1,80}$/), target: z.unknown() })
  .strict();

export function parseContactRecovery(value: unknown): ContactSubmission[] {
  const parsed = recovery.safeParse(value);

  if (!parsed.success) {
    throw new Error('contact_recovery_invalid');
  }

  const rows = parseContactExport(parsed.data.target);

  if (rows.some((row) => BigInt(row.id) > BigInt(Number.MAX_SAFE_INTEGER))) {
    // The original Astro DB JavaScript contract uses numeric IDs. Never round or renumber them.
    throw new Error('contact_legacy_id_unsafe');
  }

  return rows;
}

async function readLegacy(transaction: Transaction): Promise<ContactSubmission[]> {
  const result = await transaction.execute(
    'SELECT id, createdAt, email, locale, message, name, type FROM "ContactSubmission" ORDER BY id',
  );

  return parseContactExport(
    result.rows.map((row) => {
      // Astro DB 0.20 stores dates as TEXT, including SQLite CURRENT_TIMESTAMP defaults.
      const date = String(row['createdAt']).replace(' ', 'T');
      const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(date) ? date : date + 'Z';

      return {
        id: String(row['id']),
        createdAt: timestamp,
        email: row['email'],
        locale: row['locale'],
        message: row['message'],
        name: row['name'],
        type: row['type'],
      };
    }),
  );
}

export async function restoreLegacyContacts(
  client: Client,
  input: ContactSubmission[],
  options: { apply?: boolean; writesFrozen?: boolean; backupPath?: string },
): Promise<{ source: number; existing: number; inserted: number; dryRun: boolean }> {
  if (options.apply && (!options.writesFrozen || !options.backupPath)) {
    throw new Error('contact_legacy_restore_requires_frozen_writes_and_backup');
  }

  const source = parseContactRecovery({ version: 1, batch: 'restore-validation', target: input });
  const transaction = await client.transaction(options.apply ? 'write' : 'read');

  try {
    const before = await readLegacy(transaction);
    const existing = new Map(before.map((row) => [row.id, row]));
    const missing: ContactSubmission[] = [];

    for (const row of source) {
      const previous = existing.get(row.id);

      if (previous && digest(previous) !== digest(row)) {
        throw new Error('contact_legacy_reconciliation_conflict');
      }

      if (!previous) {
        missing.push(row);
      }
    }

    if (options.apply) {
      await writeFile(
        options.backupPath!,
        JSON.stringify({ version: 1, kind: 'legacy-before-restore', target: before, source }),
        { flag: 'wx', mode: 0o600 },
      );

      for (const row of missing) {
        await transaction.execute({
          sql: 'INSERT INTO "ContactSubmission" (id, createdAt, email, locale, message, name, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [BigInt(row.id), row.createdAt, row.email, row.locale, row.message, row.name, row.type],
        });
      }

      const after = await readLegacy(transaction);
      const reconciled = new Map(after.map((row) => [row.id, row]));

      if (
        after.length !== before.length + missing.length ||
        [...before, ...source].some((row) => !reconciled.has(row.id) || digest(reconciled.get(row.id)!) !== digest(row))
      ) {
        throw new Error('contact_legacy_reconciliation_failed');
      }
    }

    await transaction.commit();

    return {
      source: source.length,
      existing: source.length - missing.length,
      inserted: missing.length,
      dryRun: !options.apply,
    };
  } catch (error) {
    await transaction.rollback();

    if (error instanceof Error && /^contact_[a-z_]+$/.test(error.message)) {
      throw error;
    }

    throw new Error('contact_legacy_restore_failed', { cause: error });
  } finally {
    transaction.close();
  }
}
