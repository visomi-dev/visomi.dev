import { execFile } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { createClient, type Client } from '@libsql/client';
import { workspaceRoot } from '@nx/devkit';
import { Pool } from 'pg';
import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';

import fixtures from './fixtures.json';
import { parseContactRecovery, restoreLegacyContacts } from './legacy-restore';
import { migrateContacts, parseContactExport, rollbackContacts } from './migration';
import { createContactRepository } from './repository';

const execute = promisify(execFile);
const source = parseContactExport(fixtures);
let database: Awaited<ReturnType<typeof testPostgres>>;
let pool: Pool;
let legacy: Client;

beforeAll(async () => {
  const resource = await testPostgres();

  database = resource;
  pool = new Pool({ connectionString: database.url });
  legacy = createClient({ url: `file:${join(database.directory, 'legacy.db')}`, intMode: 'bigint' });

  // Mirrors Astro DB 0.20.1 column.number/date/text and the original ContactSubmission schema.
  await legacy.execute(`CREATE TABLE "ContactSubmission" (
    id INTEGER PRIMARY KEY, createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email TEXT NOT NULL, locale TEXT NOT NULL, message TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL)`);
});
afterAll(async () => {
  legacy?.close();

  await pool?.end();

  await database?.stop();
});
beforeEach(async () => {
  await legacy.execute('DROP TRIGGER IF EXISTS synthetic_restore_failure');

  await legacy.execute('DROP TRIGGER IF EXISTS synthetic_restore_change');

  await legacy.execute('DELETE FROM "ContactSubmission"');

  await pool.query('TRUNCATE contact_submissions, contact_imports RESTART IDENTITY');

  await pool.query('UPDATE contact_control SET frozen=true');
});

it('replays PostgreSQL recovery into libSQL, reconciles all fields, and resumes the legacy writer without ID reuse', async () => {
  await restoreLegacyContacts(legacy, source, {
    apply: true,
    writesFrozen: true,
    backupPath: join(database.directory, 'legacy-initial.json'),
  });

  await migrateContacts(pool, source, {
    apply: true,
    batch: 'roundtrip',
    backupPath: join(database.directory, 'pg-initial.json'),
  });

  await pool.query('UPDATE contact_control SET frozen=false');

  const repository = createContactRepository(pool);

  await repository.submit({ ...source[1], message: 'Synthetic post-cutover 😀 <script>payload</script>' });

  const beforeRollback = await repository.list(undefined, 10);

  await pool.query('UPDATE contact_control SET frozen=true');

  const recoveryPath = join(database.directory, 'rollback-complete.json');

  await rollbackContacts(pool, 'roundtrip', recoveryPath);

  const recoveryText = await readFile(recoveryPath, 'utf8');
  const recovered = parseContactRecovery(JSON.parse(recoveryText));

  expect(recovered).toEqual([...beforeRollback].reverse());
  const dryRun = await restoreLegacyContacts(legacy, recovered, {});

  expect(dryRun).toEqual({
    source: 3,
    existing: 2,
    inserted: 1,
    dryRun: true,
  });

  const recoveryBackup = join(database.directory, 'legacy-recovery-backup.json');
  const restored = await restoreLegacyContacts(legacy, recovered, {
    apply: true,
    writesFrozen: true,
    backupPath: recoveryBackup,
  });

  expect(restored).toEqual({ source: 3, existing: 2, inserted: 1, dryRun: false });
  const backupStat = await stat(recoveryBackup);

  expect(backupStat.mode & 0o777).toBe(0o600);

  const backupText = await readFile(recoveryBackup, 'utf8');

  expect(JSON.parse(backupText).target).toEqual(source);
  expect(JSON.parse(backupText).source).toEqual(recovered);

  const oldWriter = await legacy.execute({
    sql: 'INSERT INTO "ContactSubmission" (email,locale,message,name,type) VALUES (?,?,?,?,?) RETURNING id,createdAt',
    args: ['resumed@example.test', 'es', 'Synthetic resumed legacy writer.', 'Legacy Writer', 'other'],
  });

  expect(oldWriter.rows[0]['id']).toBe(4n);
  expect(typeof oldWriter.rows[0]['createdAt']).toBe('string');
  const retried = await restoreLegacyContacts(legacy, recovered, {
    apply: true,
    writesFrozen: true,
    backupPath: join(database.directory, 'legacy-idempotent.json'),
  });

  expect(retried).toMatchObject({ existing: 3, inserted: 0 });

  const retained = await legacy.execute('SELECT id,message FROM "ContactSubmission" ORDER BY id');

  expect(retained.rows).toHaveLength(4);
  expect(retained.rows[2]['message']).toBe(beforeRollback[0].message);
  expect(retained.rows[3]['message']).toBe('Synthetic resumed legacy writer.');
});

it('rolls back partial inserts and reconciliation failures without overwriting the recovery backup', async () => {
  await legacy.execute(`CREATE TRIGGER synthetic_restore_failure BEFORE INSERT ON "ContactSubmission"
    WHEN NEW.id=2 BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END`);

  const options = { apply: true, writesFrozen: true, backupPath: join(database.directory, 'legacy-partial.json') };

  await expect(restoreLegacyContacts(legacy, source, options)).rejects.toThrow('contact_legacy_restore_failed');

  const empty = await legacy.execute('SELECT id FROM "ContactSubmission"');

  expect(empty.rows).toEqual([]);

  await legacy.execute('DROP TRIGGER synthetic_restore_failure');

  await expect(restoreLegacyContacts(legacy, source, options)).rejects.toThrow('contact_legacy_restore_failed');

  await legacy.execute(`CREATE TRIGGER synthetic_restore_change AFTER INSERT ON "ContactSubmission"
    BEGIN UPDATE "ContactSubmission" SET message='Synthetic changed content' WHERE id=NEW.id; END`);

  await expect(
    restoreLegacyContacts(legacy, source, {
      ...options,
      backupPath: join(database.directory, 'legacy-changed.json'),
    }),
  ).rejects.toThrow('contact_legacy_reconciliation_failed');
});

it('rejects conflicting content, missing freeze approval and an invalid legacy schema', async () => {
  await expect(restoreLegacyContacts(legacy, source, { apply: true })).rejects.toThrow('requires_frozen_writes');

  await expect(restoreLegacyContacts(legacy, source, { apply: true, writesFrozen: true })).rejects.toThrow(
    'requires_frozen_writes',
  );

  await restoreLegacyContacts(legacy, source, {
    apply: true,
    writesFrozen: true,
    backupPath: join(database.directory, 'legacy-conflict-initial.json'),
  });

  await legacy.execute('UPDATE "ContactSubmission" SET message=? WHERE id=1', ['Synthetic conflicting content']);

  await expect(restoreLegacyContacts(legacy, source, {})).rejects.toThrow('contact_legacy_reconciliation_conflict');

  await legacy.execute('UPDATE "ContactSubmission" SET createdAt=? WHERE id=1', ['not a date']);

  await expect(restoreLegacyContacts(legacy, source, {})).rejects.toThrow('contact_export_invalid');
});

it('refuses malformed recovery frames, unsafe numeric IDs and conflicting duplicates before replay', () => {
  expect(() => parseContactRecovery({ version: 2, batch: 'x', target: source })).toThrow('contact_recovery_invalid');
  expect(() => parseContactRecovery({ version: 1, batch: 'x', target: source, source })).toThrow(
    'contact_recovery_invalid',
  );
  expect(() =>
    parseContactRecovery({ version: 1, batch: 'x', target: [{ ...source[0], id: '9007199254740992' }] }),
  ).toThrow('contact_legacy_id_unsafe');
  expect(() => parseContactRecovery({ version: 1, batch: 'x', target: null })).toThrow('contact_export_invalid');
});

it('runs the real operator CLI in read-only and apply modes with count-only output', async () => {
  const input = join(database.directory, 'cli-recovery.json');

  await writeFile(input, JSON.stringify({ version: 1, batch: 'cli', target: source }));

  const command = ['--import', 'tsx', 'apps/web/api/tools/contact/restore-legacy.ts', '--input', input];
  const env = {
    ...process.env,
    FORCE_COLOR: undefined,
    TSX_TSCONFIG_PATH: 'tsconfig.base.json',
    CONTACT_LEGACY_DATABASE_URL: `file:${join(database.directory, 'legacy.db')}`,
    CONTACT_LEGACY_DATABASE_AUTH_TOKEN: '',
  };
  const dryRun = await execute(process.execPath, command, { env, cwd: workspaceRoot });

  expect(JSON.parse(dryRun.stdout)).toEqual({ source: 2, existing: 0, inserted: 2, dryRun: true });
  expect(dryRun.stdout).not.toContain('example.test');

  const apply = await execute(
    process.execPath,
    [...command, '--apply', '--writes-frozen', '--backup', join(database.directory, 'cli-backup.json')],
    { env, cwd: workspaceRoot },
  );

  expect(JSON.parse(apply.stdout)).toMatchObject({ inserted: 2, dryRun: false });

  const absent = join(database.directory, 'must-not-be-created.db');

  await expect(
    execute(process.execPath, command, {
      cwd: workspaceRoot,
      env: { ...env, CONTACT_LEGACY_DATABASE_URL: `file:${absent}` },
    }),
  ).rejects.toMatchObject({ stderr: 'contact_legacy_restore_failed\n' });

  await expect(stat(absent)).rejects.toMatchObject({ code: 'ENOENT' });

  await expect(
    execute(process.execPath, command, {
      cwd: workspaceRoot,
      env: { ...env, CONTACT_LEGACY_DATABASE_URL: 'http://unapproved.example.test' },
    }),
  ).rejects.toMatchObject({ stderr: 'contact_legacy_restore_failed\n' });

  await expect(
    execute(process.execPath, ['--import', 'tsx', 'apps/web/api/tools/contact/restore-legacy.ts'], {
      env,
      cwd: workspaceRoot,
    }),
  ).rejects.toMatchObject({ stderr: 'contact_legacy_restore_failed\n' });
});
