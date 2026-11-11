import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const boundary = vi.hoisted(() => ({
  values: {} as Record<string, unknown>,
  end: vi.fn(),
  migrate: vi.fn(),
  rollback: vi.fn(),
  read: vi.fn(),
  pool: vi.fn(),
}));

vi.mock('node:util', () => ({ parseArgs: () => ({ values: boundary.values }) }));
vi.mock('node:fs/promises', () => ({ readFile: boundary.read }));
vi.mock('pg', () => ({
  Pool: class {
    end = boundary.end;

    constructor(options: unknown) {
      boundary.pool(options);
    }
  },
}));
vi.mock('./migration', () => ({
  migrateContacts: boundary.migrate,
  rollbackContacts: boundary.rollback,
  parseContactExport: (value: unknown) => value,
}));
const exitCode = process.exitCode;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('DATABASE_URL', 'postgresql://synthetic-local-only');
  boundary.values = { batch: 'synthetic', input: 'offline-synthetic.json' };
  boundary.read.mockResolvedValue('[]');
  boundary.end.mockResolvedValue(undefined);
  boundary.migrate.mockResolvedValue({ dryRun: true, inserted: 0 });
  boundary.rollback.mockResolvedValue({ removed: 2, preserved: 1 });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  process.exitCode = exitCode;
});
it.each(['batch', 'database', 'rollback', 'input', 'json', 'database-failure'])(
  'fails safely for invalid CLI configuration: %s',
  async (kind) => {
    const output = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    if (kind === 'batch') {
      delete boundary.values.batch;
    }

    if (kind === 'database') {
      vi.stubEnv('DATABASE_URL', '');
    }

    if (kind === 'rollback') {
      boundary.values = { batch: 'synthetic', rollback: true, apply: true };
    }

    if (kind === 'input') {
      delete boundary.values.input;
    }

    if (kind === 'json') {
      boundary.read.mockResolvedValue('invalid');
    }

    if (kind === 'database-failure') {
      boundary.migrate.mockRejectedValue(new Error('SYNTHETIC_PRIVATE_DATABASE'));
    }

    await import('./migrate');

    await vi.waitFor(() => expect(output).toHaveBeenCalledWith('contact_migration_failed\n'));

    expect(process.exitCode).toBe(1);

    if (['input', 'json', 'database-failure'].includes(kind)) {
      expect(boundary.end).toHaveBeenCalledOnce();
    }
  },
);
it.each([false, true])(
  'executes dry-run or explicit backup-protected rollback and closes its pool: %s',
  async (rollback) => {
    const output = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    if (rollback) {
      boundary.values = { batch: 'synthetic', rollback: true, apply: true, backup: 'recovery.json' };
    }

    await import('./migrate');

    await vi.waitFor(() => expect(boundary.end).toHaveBeenCalledOnce());

    expect(output).toHaveBeenCalledWith(
      JSON.stringify(rollback ? { removed: 2, preserved: 1 } : { dryRun: true, inserted: 0 }) + '\n',
    );

    if (rollback) {
      expect(boundary.rollback).toHaveBeenCalledWith(expect.anything(), 'synthetic', 'recovery.json');
    } else {
      expect(boundary.migrate).toHaveBeenCalledWith(expect.anything(), [], {
        batch: 'synthetic',
        apply: undefined,
        backupPath: undefined,
      });
    }
  },
);
