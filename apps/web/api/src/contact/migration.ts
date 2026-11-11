import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

import type { Pool, PoolClient } from 'pg';
import { z } from 'zod';

import { contactInput } from './router';
import type { ContactSubmission } from './repository';

const sourceRow = contactInput.extend({
  id: z.union([z.string().regex(/^[1-9]\d{0,18}$/), z.number().int().positive().safe()]).transform(String),
  createdAt: z
    .string()
    .datetime({ offset: true })
    .transform((value) => new Date(value).toISOString()),
});

export function parseContactExport(value: unknown): ContactSubmission[] {
  const rows = z.array(sourceRow).max(1_000_000).safeParse(value);

  if (!rows.success) {
    throw new Error('contact_export_invalid');
  }

  const unique = new Map<string, ContactSubmission>();

  for (const row of rows.data) {
    if (BigInt(row.id) > 9223372036854775807n) {
      throw new Error('contact_export_invalid');
    }

    const previous = unique.get(row.id);

    if (previous && digest(previous) !== digest(row)) {
      throw new Error('contact_export_duplicate_conflict');
    }

    unique.set(row.id, row);
  }

  return [...unique.values()].sort((left, right) => (BigInt(left.id) < BigInt(right.id) ? -1 : 1));
}

function digest(row: ContactSubmission): string {
  return createHash('sha256')
    .update(
      JSON.stringify([
        row.id,
        new Date(row.createdAt).toISOString(),
        row.email,
        row.locale,
        row.message,
        row.name,
        row.type,
      ]),
    )
    .digest('hex');
}

async function readRows(client: PoolClient): Promise<ContactSubmission[]> {
  const result = await client.query<ContactSubmission & { createdAt: Date }>(
    'SELECT id::text, created_at AS "createdAt", email, locale, message, name, type FROM contact_submissions ORDER BY contact_submissions.id',
  );

  return result.rows.map((row) => ({ ...row, createdAt: new Date(row.createdAt).toISOString() }));
}

async function requireFrozen(client: PoolClient): Promise<void> {
  const control = await client.query<{ frozen: boolean }>(
    'SELECT frozen FROM contact_control WHERE singleton FOR UPDATE',
  );

  if (control.rows.length !== 1 || control.rows[0].frozen !== true) {
    throw new Error('contact_writes_must_be_frozen');
  }
}

export async function migrateContacts(
  pool: Pool,
  source: ContactSubmission[],
  options: { apply?: boolean; backupPath?: string; batch: string },
): Promise<{ source: number; existing: number; inserted: number; dryRun: boolean }> {
  if (!/^[a-z0-9-]{1,80}$/.test(options.batch)) {
    throw new Error('contact_batch_invalid');
  }

  const input = parseContactExport(source);
  const client = await pool.connect();

  try {
    await client.query(
      options.apply ? 'BEGIN ISOLATION LEVEL SERIALIZABLE' : 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );

    if (options.apply) {
      await client.query('SELECT pg_advisory_xact_lock(78239421)');

      await requireFrozen(client);
    }

    const before = await readRows(client);
    const byId = new Map(before.map((row) => [row.id, row]));
    const missing: ContactSubmission[] = [];

    for (const row of input) {
      const existing = byId.get(row.id);

      if (existing && digest(existing) !== digest(row)) {
        throw new Error('contact_reconciliation_conflict');
      }

      if (!existing) {
        missing.push(row);
      }
    }

    if (options.apply) {
      if (!options.backupPath) {
        throw new Error('contact_backup_required');
      }

      // O_EXCL prevents silently replacing an earlier recovery artifact. Never log its content.
      await writeFile(
        options.backupPath,
        JSON.stringify({ version: 1, batch: options.batch, target: before, source: input }),
        { flag: 'wx', mode: 0o600 },
      );

      for (const row of missing) {
        await client.query(
          'INSERT INTO contact_submissions (id,created_at,email,locale,message,name,type) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [row.id, row.createdAt, row.email, row.locale, row.message, row.name, row.type],
        );

        await client.query('INSERT INTO contact_imports (source_id,batch,digest) VALUES ($1,$2,$3)', [
          row.id,
          options.batch,
          digest(row),
        ]);
      }

      // Only advance the sequence. Retried batches and rollback never reuse an already issued ID.
      await client.query(
        "SELECT setval(pg_get_serial_sequence('contact_submissions','id'), GREATEST((SELECT COALESCE(max(id),1) FROM contact_submissions),(SELECT last_value FROM contact_submissions_id_seq)), true)",
      );

      const awaitedResult1 = await readRows(client);
      const after = new Map(awaitedResult1.map((row) => [row.id, row]));

      if (
        after.size !== before.length + missing.length ||
        input.some((row) => !after.has(row.id) || digest(after.get(row.id)!) !== digest(row))
      ) {
        throw new Error('contact_reconciliation_failed');
      }
    }

    await client.query('COMMIT');

    return {
      source: input.length,
      existing: input.length - missing.length,
      inserted: missing.length,
      dryRun: !options.apply,
    };
  } catch (error) {
    await client.query('ROLLBACK');

    // Public error codes are fixed strings, never SQL, credentials or source values.
    if (error instanceof Error && /^contact_[a-z_]+$/.test(error.message)) {
      throw error;
    }

    throw new Error('contact_migration_failed', { cause: error });
  } finally {
    client.release();
  }
}

export async function rollbackContacts(
  pool: Pool,
  batch: string,
  recoveryPath: string,
): Promise<{ removed: number; preserved: number }> {
  if (!/^[a-z0-9-]{1,80}$/.test(batch)) {
    throw new Error('contact_batch_invalid');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    await client.query('SELECT pg_advisory_xact_lock(78239421)');

    await requireFrozen(client);

    const before = await readRows(client);
    const lineage = await client.query<{ source_id: string; digest: string }>(
      'SELECT source_id::text,digest FROM contact_imports WHERE batch=$1',
      [batch],
    );
    const imported = new Map(lineage.rows.map((row) => [row.source_id, row.digest]));

    if (before.some((row) => imported.has(row.id) && imported.get(row.id) !== digest(row))) {
      throw new Error('contact_rollback_conflict');
    }

    // Includes post-cutover requests. Operator can replay them into Turso before switching the old writer on.
    await writeFile(recoveryPath, JSON.stringify({ version: 1, batch, target: before }), { flag: 'wx', mode: 0o600 });

    await client.query('DELETE FROM contact_imports WHERE batch=$1', [batch]);

    if (imported.size) {
      await client.query('DELETE FROM contact_submissions WHERE id=ANY($1::bigint[])', [[...imported.keys()]]);
    }

    await client.query('COMMIT');

    return { removed: imported.size, preserved: before.length - imported.size };
  } catch (error) {
    await client.query('ROLLBACK');

    if (error instanceof Error && /^contact_[a-z_]+$/.test(error.message)) {
      throw error;
    }

    throw new Error('contact_rollback_failed', { cause: error });
  } finally {
    client.release();
  }
}
