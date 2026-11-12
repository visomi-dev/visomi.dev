import type { Pool } from 'pg';

export type ContactInput = {
  email: string;
  locale: 'en' | 'es';
  message: string;
  name: string;
  type: 'consulting' | 'speaking' | 'fulltime' | 'other';
};
export type ContactSubmission = ContactInput & { id: string; createdAt: string };
export type ContactRepository = {
  submit(input: ContactInput): Promise<void>;
  list(before: string | undefined, limit: number): Promise<ContactSubmission[]>;
  detail(id: string): Promise<ContactSubmission | undefined>;
  ready(): Promise<void>;
};

const projection = 'id::text, created_at AS "createdAt", email, locale, message, name, type';
const serialize = (row: ContactInput & { id: string; createdAt: Date }): ContactSubmission => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

export function createContactRepository(pool: Pool): ContactRepository {
  return {
    async submit(input) {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // The migration takes the exclusive version of this same lock.
        await client.query('SELECT pg_advisory_xact_lock_shared(78239421)');

        const gate = await client.query<{ frozen: boolean }>('SELECT frozen FROM contact_control WHERE singleton');

        if (gate.rows.length !== 1 || gate.rows[0].frozen) {
          throw new Error('contact_writes_frozen');
        }

        await client.query(
          'INSERT INTO contact_submissions (email, locale, message, name, type) VALUES ($1,$2,$3,$4,$5)',
          [input.email, input.locale, input.message, input.name, input.type],
        );

        await client.query('COMMIT');
      } catch {
        await client.query('ROLLBACK');

        throw new Error('contact_unavailable');
      } finally {
        client.release();
      }
    },
    async list(before, limit) {
      const rows = await pool.query<ContactInput & { id: string; createdAt: Date }>(
        `SELECT ${projection} FROM contact_submissions WHERE ($1::bigint IS NULL OR id < $1) ORDER BY contact_submissions.id DESC LIMIT $2`,
        [before ?? null, limit],
      );

      return rows.rows.map(serialize);
    },
    async detail(id) {
      const rows = await pool.query<ContactInput & { id: string; createdAt: Date }>(
        `SELECT ${projection} FROM contact_submissions WHERE id = $1`,
        [id],
      );

      return rows.rows[0] ? serialize(rows.rows[0]) : undefined;
    },
    async ready() {
      const result = await pool.query('SELECT 1 FROM contact_control WHERE singleton');

      if (result.rowCount !== 1) {
        throw new Error('contact_unavailable');
      }
    },
  };
}
