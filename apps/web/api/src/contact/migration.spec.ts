import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';
import { Pool } from 'pg';

import fixtures from './fixtures.json';
import { migrateContacts, parseContactExport, rollbackContacts } from './migration';
import { createContactRepository } from './repository';

describe('offline export validation', () => {
  it('normalizes legacy numeric IDs and timestamps without altering message content', () => {
    expect(parseContactExport(fixtures)[1]).toMatchObject({ id: '2', message: fixtures[1].message });
    expect(parseContactExport([...fixtures, fixtures[0]])).toHaveLength(2);
    expect(parseContactExport([...fixtures].reverse()).map((row) => row.id)).toEqual(['1', '2']);
  });
  it('rejects conflicting duplicates and invalid records before opening a database connection', () => {
    expect(() =>
      parseContactExport([...fixtures, { ...fixtures[0], message: 'Conflicting synthetic content' }]),
    ).toThrow('contact_export_duplicate_conflict');
    expect(() => parseContactExport([{ ...fixtures[0], id: '9223372036854775808' }])).toThrow('contact_export_invalid');
    expect(() => parseContactExport([{ ...fixtures[0], id: -1 }])).toThrow('contact_export_invalid');
    expect(() =>
      parseContactExport([{ ...fixtures[0], message: 'Invalid\\u0000text'.replace('\\u0000', '\u0000') }]),
    ).toThrow('contact_export_invalid');
    expect(() => parseContactExport([{ ...fixtures[0], name: '\ud800x' }])).toThrow('contact_export_invalid');
    expect(() => parseContactExport([{ ...fixtures[0], name: 'X' }])).toThrow('contact_export_invalid');
    expect(() => parseContactExport([{ ...fixtures[0], name: 'x'.repeat(121) }])).toThrow('contact_export_invalid');
    expect(() => parseContactExport([{ ...fixtures[0], message: 'x'.repeat(5001) }])).toThrow('contact_export_invalid');
    expect(() => parseContactExport([{ ...fixtures[0], createdAt: 'invalid' }])).toThrow('contact_export_invalid');
  });
});

describe('PostgreSQL contact migration rehearsal', () => {
  let database: Awaited<ReturnType<typeof testPostgres>>;
  let pool: Pool;

  beforeAll(async () => {
    const awaitedResult1 = await testPostgres();

    database = awaitedResult1;
    pool = new Pool({ connectionString: database.url, max: 4 });
  }, 120_000);
  afterAll(async () => {
    await pool?.end();

    await database?.stop();
  }, 120_000);

  beforeEach(async () => {
    await pool.query('DROP TRIGGER IF EXISTS synthetic_import_failure ON contact_submissions');

    await pool.query('TRUNCATE contact_submissions, contact_imports RESTART IDENTITY');

    await pool.query('UPDATE contact_control SET frozen=false');
  });

  it('rolls back a partial SQL failure and retries safely using a new exclusive backup', async () => {
    await pool.query('UPDATE contact_control SET frozen=true');

    await pool.query(`CREATE OR REPLACE FUNCTION synthetic_import_failure() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN IF NEW.id=2 THEN RAISE EXCEPTION 'synthetic failure'; END IF; RETURN NEW; END $$`);

    await pool.query(
      'CREATE TRIGGER synthetic_import_failure BEFORE INSERT ON contact_submissions FOR EACH ROW EXECUTE FUNCTION synthetic_import_failure()',
    );

    const source = parseContactExport(fixtures);
    const options = { apply: true, batch: 'partial', backupPath: join(database.directory, 'partial.json') };

    await expect(migrateContacts(pool, source, options)).rejects.toThrow('contact_migration_failed');

    const rows = await pool.query('SELECT * FROM contact_submissions');
    const lineage = await pool.query('SELECT * FROM contact_imports');

    expect(rows.rowCount).toBe(0);
    expect(lineage.rowCount).toBe(0);

    await pool.query('DROP TRIGGER synthetic_import_failure ON contact_submissions');

    await expect(migrateContacts(pool, source, options)).rejects.toThrow('contact_migration_failed');

    const result = await migrateContacts(pool, source, {
      ...options,
      backupPath: join(database.directory, 'partial-retry.json'),
    });

    expect(result.inserted).toBe(2);
    const awaitedResult1 = await readFile(options.backupPath, 'utf8');
    const backup = JSON.parse(awaitedResult1);

    expect(backup.target).toEqual([]);
    expect(parseContactExport(backup.source)).toEqual(source);
  });

  it('rejects conflicting source and rollback content without modifying existing rows', async () => {
    await pool.query('UPDATE contact_control SET frozen=true');

    const source = parseContactExport(fixtures);

    await migrateContacts(pool, source, {
      apply: true,
      batch: 'conflict',
      backupPath: join(database.directory, 'conflict.json'),
    });

    const changed = source.map((row) => ({ ...row, message: 'Conflicting synthetic message' }));

    await expect(migrateContacts(pool, changed, { batch: 'conflict' })).rejects.toThrow(
      'contact_reconciliation_conflict',
    );

    await pool.query("UPDATE contact_submissions SET message='Synthetic edited imported request' WHERE id=1");

    await expect(
      rollbackContacts(pool, 'conflict', join(database.directory, 'conflict-rollback.json')),
    ).rejects.toThrow('contact_rollback_conflict');

    const rows = await pool.query('SELECT * FROM contact_submissions');
    const lineage = await pool.query('SELECT * FROM contact_imports');

    expect(rows.rowCount).toBe(2);
    expect(lineage.rowCount).toBe(2);
  });

  it('serializes concurrent cutovers and denies public writes across the frozen gate', async () => {
    await pool.query('UPDATE contact_control SET frozen=true');

    const blocker = await pool.connect();

    await blocker.query('BEGIN');

    await blocker.query('SELECT pg_advisory_xact_lock(78239421)');

    const source = parseContactExport(fixtures);
    const first = migrateContacts(pool, source, {
      apply: true,
      batch: 'concurrent',
      backupPath: join(database.directory, 'concurrent-a.json'),
    });
    const second = migrateContacts(pool, source, {
      apply: true,
      batch: 'concurrent',
      backupPath: join(database.directory, 'concurrent-b.json'),
    });
    const write = createContactRepository(pool).submit(source[0]);
    // Attach rejection handlers before releasing the competing transactions.
    const results = Promise.allSettled([first, second, write]);

    await blocker.query('COMMIT');

    blocker.release();
    const settled = await results;

    expect(settled.slice(0, 2).some((result) => result.status === 'fulfilled')).toBe(true);
    expect(settled[2]).toMatchObject({ status: 'rejected', reason: new Error('contact_unavailable') });
    for (const result of settled.slice(0, 2)) {
      if (result.status === 'rejected') {
        expect(result.reason.message).toBe('contact_migration_failed');
      }
    }
    const retry = await migrateContacts(pool, source, {
      apply: true,
      batch: 'concurrent',
      backupPath: join(database.directory, 'concurrent-retry.json'),
    });

    expect(retry.inserted).toBe(0);
    const rows = await pool.query('SELECT * FROM contact_submissions');

    expect(rows.rowCount).toBe(2);
    const lineage = await pool.query('SELECT * FROM contact_imports');

    expect(lineage.rowCount).toBe(2);
  });

  it('requires valid batch, frozen state and a new backup before any destructive transaction', async () => {
    const source = parseContactExport(fixtures);

    await expect(migrateContacts(pool, source, { batch: '../invalid' })).rejects.toThrow('contact_batch_invalid');

    await expect(rollbackContacts(pool, '../invalid', 'unused')).rejects.toThrow('contact_batch_invalid');

    await expect(rollbackContacts(pool, 'unfrozen', 'unused')).rejects.toThrow('contact_writes_must_be_frozen');

    await pool.query('UPDATE contact_control SET frozen=true');

    await expect(migrateContacts(pool, source, { batch: 'no-backup', apply: true })).rejects.toThrow(
      'contact_backup_required',
    );

    await expect(rollbackContacts(pool, 'missing', '/unavailable/synthetic/recovery.json')).rejects.toThrow(
      'contact_rollback_failed',
    );
  });

  it('detects server-side content changes during reconciliation and rolls back every inserted record', async () => {
    await pool.query('UPDATE contact_control SET frozen=true');

    await pool.query(`CREATE OR REPLACE FUNCTION synthetic_import_failure() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN NEW.message='Synthetic server-side altered value'; RETURN NEW; END $$`);

    await pool.query(
      'CREATE TRIGGER synthetic_import_failure BEFORE INSERT ON contact_submissions FOR EACH ROW EXECUTE FUNCTION synthetic_import_failure()',
    );

    await expect(
      migrateContacts(pool, parseContactExport(fixtures), {
        batch: 'altered',
        apply: true,
        backupPath: join(database.directory, 'altered.json'),
      }),
    ).rejects.toThrow('contact_reconciliation_failed');

    const rows = await pool.query('SELECT * FROM contact_submissions');

    expect(rows.rowCount).toBe(0);
  });

  it('preserves supplementary Unicode using the original JavaScript length rules', async () => {
    const source = parseContactExport([{ ...fixtures[0], name: '😀', message: '😀'.repeat(5) }]);

    await pool.query('UPDATE contact_control SET frozen=true');

    await migrateContacts(pool, source, {
      batch: 'unicode',
      apply: true,
      backupPath: join(database.directory, 'unicode.json'),
    });

    const record = await createContactRepository(pool).detail('1');

    expect(record).toEqual(source[0]);
  });

  it('supports dry-run, frozen cutover, idempotent retries, full reconciliation and lossless rollback', async () => {
    const source = parseContactExport(fixtures);
    const before = await pool.query('SELECT * FROM contact_submissions');

    expect(before.rows).toEqual([]);
    const awaitedResult2 = await migrateContacts(pool, source, { batch: 'rehearsal' });

    expect(awaitedResult2).toEqual({
      source: 2,
      existing: 0,
      inserted: 2,
      dryRun: true,
    });
    const awaitedResult3 = await pool.query('SELECT * FROM contact_submissions');

    expect(awaitedResult3.rows).toEqual([]);

    await expect(
      migrateContacts(pool, source, {
        apply: true,
        batch: 'rehearsal',
        backupPath: join(database.directory, 'unfrozen.json'),
      }),
    ).rejects.toThrow('contact_writes_must_be_frozen');

    await pool.query('UPDATE contact_control SET frozen=true');

    const backup = join(database.directory, 'backup.json');

    const awaitedResult4 = await migrateContacts(pool, source, { apply: true, batch: 'rehearsal', backupPath: backup });

    expect(awaitedResult4.inserted).toBe(2);
    const awaitedResult5 = await stat(backup);

    expect(awaitedResult5.mode & 0o777).toBe(0o600);
    const awaitedResult6 = await readFile(backup, 'utf8');

    expect(JSON.parse(awaitedResult6).source).toEqual(source);
    const awaitedResult7 = await migrateContacts(pool, source, {
      apply: true,
      batch: 'rehearsal',
      backupPath: join(database.directory, 'retry.json'),
    });

    expect(awaitedResult7.inserted).toBe(0);
    const repository = createContactRepository(pool);

    const awaitedResult8 = await repository.detail('2');

    expect(awaitedResult8).toEqual(source[1]);

    await expect(repository.submit(source[0])).rejects.toThrow('contact_unavailable');

    await pool.query('UPDATE contact_control SET frozen=false');

    const { id: _id, createdAt: _createdAt, ...newInput } = source[0];

    await repository.submit({ ...newInput, message: 'Synthetic post-cutover request' });

    const awaitedResult9 = await repository.list(undefined, 10);
    const native = awaitedResult9.find((row) => row.message === 'Synthetic post-cutover request');

    expect(BigInt(native!.id)).toBeGreaterThan(2n);

    await pool.query('UPDATE contact_control SET frozen=true');

    const recovery = join(database.directory, 'recovery.json');

    const awaitedResult10 = await rollbackContacts(pool, 'rehearsal', recovery);

    expect(awaitedResult10).toEqual({ removed: 2, preserved: 1 });
    const awaitedResult11 = await readFile(recovery, 'utf8');
    const saved = JSON.parse(awaitedResult11);

    expect(saved.target).toHaveLength(3);
    expect(saved.target).toContainEqual(native);
    const awaitedResult12 = await repository.list(undefined, 10);

    expect(awaitedResult12).toEqual([native]);
    const awaitedResult13 = await rollbackContacts(pool, 'rehearsal', join(database.directory, 'retry-rollback.json'));

    expect(awaitedResult13).toEqual({
      removed: 0,
      preserved: 1,
    });
    const recoveryRows = parseContactExport(saved.target);
    const restored = await migrateContacts(pool, recoveryRows, {
      apply: true,
      batch: 'synthetic-restoration',
      backupPath: join(database.directory, 'restore-before-state.json'),
    });

    expect(restored).toMatchObject({ inserted: 2, existing: 1, dryRun: false });
    const restoredRows = await repository.list(undefined, 10);

    expect(restoredRows.reverse()).toEqual(recoveryRows);
  });
});
