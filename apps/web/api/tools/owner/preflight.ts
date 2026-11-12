import { Pool } from 'pg';
import { z } from 'zod';

import { createSmtp, smtpConfig } from '@visomi-stack/backend-shared/lib/mail/smtp';

import { authConfig } from '../../src/auth/shared/config';

const safeCodes = new Set([
  'owner_configuration_invalid',
  'owner_identity_unavailable',
  'owner_password_unavailable',
  'owner_identity_mismatch',
  'owner_totp_key_required',
]);

async function run(): Promise<void> {
  const env = process.env;
  const email = z.email().safeParse(env['OWNER_EMAIL']);
  const smtp = smtpConfig(env);

  if (!email.success || !env['DATABASE_URL'] || !smtp) {
    throw new Error('owner_configuration_invalid');
  }

  try {
    authConfig({
      origin: env['AUTH_ORIGIN'] ?? '',
      rpId: env['AUTH_RP_ID'] ?? '',
      secret: env['SESSION_SECRET'] ?? '',
      totpKey: env['AUTH_TOTP_ENCRYPTION_KEY'] || undefined,
    });
    // Construction validates configuration. No verify/send call is made and no mail is sent.
    createSmtp(smtp).close();
  } catch {
    throw new Error('owner_configuration_invalid');
  }

  const pool = new Pool({ connectionString: env['DATABASE_URL'], max: 1, connectionTimeoutMillis: 3000 });

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN TRANSACTION READ ONLY');

      const result = await client.query<{ id: string; password: boolean; totp: boolean }>(
        `
        SELECT u.id::text, COALESCE(length(u.password_hash)>0,false) AS password,
          EXISTS(SELECT 1 FROM auth_totp_enrollments t WHERE t.user_id=u.id AND t.status='active') AS totp
        FROM auth_users u WHERE lower(u.email)=lower($1) AND u.email_verified_at IS NOT NULL`,
        [email.data],
      );

      await client.query('COMMIT');

      if (result.rows.length !== 1) {
        throw new Error('owner_identity_unavailable');
      }

      const owner = result.rows[0];

      if (!owner.password) {
        throw new Error('owner_password_unavailable');
      }

      if (env['OWNER_USER_ID'] && owner.id !== env['OWNER_USER_ID']) {
        throw new Error('owner_identity_mismatch');
      }

      if (owner.totp && !env['AUTH_TOTP_ENCRYPTION_KEY']) {
        throw new Error('owner_totp_key_required');
      }

      process.stdout.write(
        JSON.stringify({
          prepared: true,
          checks: 'configuration-and-existing-account',
          privateMetrics: env['VISOMI_PRIVATE_METRICS'] === 'true',
          traceExport: env['VISOMI_OTLP_TRACING'] === 'true',
          interactiveAcceptanceRequired: true,
        }) + '\n',
      );
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

void run().catch((error: unknown) => {
  const code = error instanceof Error && safeCodes.has(error.message) ? error.message : 'owner_preflight_failed';

  process.stdout.write(JSON.stringify({ prepared: false, code }) + '\n');
  process.exitCode = 1;
});
