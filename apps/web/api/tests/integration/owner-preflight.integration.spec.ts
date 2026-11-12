import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { workspaceRoot } from '@nx/devkit';
import { beforeAll, expect, it } from 'vitest';

import { authenticationFixture, password } from './support/auth';

const execute = promisify(execFile);
const fixture = authenticationFixture();
let ownerId: string;

beforeAll(async () => {
  const owner = await fixture.signup('owner@example.test');

  ownerId = owner.userId;
});

function probe(changes: NodeJS.ProcessEnv = {}) {
  return execute(process.execPath, ['--import', 'tsx', 'apps/web/api/tools/owner/preflight.ts'], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      FORCE_COLOR: undefined,
      TSX_TSCONFIG_PATH: 'tsconfig.base.json',
      DATABASE_URL: fixture.pool.options.connectionString,
      OWNER_EMAIL: 'owner@example.test',
      OWNER_USER_ID: ownerId,
      AUTH_ORIGIN: fixture.origin,
      AUTH_RP_ID: '127.0.0.1',
      SESSION_SECRET: 'synthetic-owner-preflight-secret-32-bytes',
      AUTH_TOTP_ENCRYPTION_KEY: '',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '1025',
      SMTP_FROM: 'Synthetic <auth@example.test>',
      SMTP_USER: '',
      SMTP_PASSWORD: '',
      VISOMI_PRIVATE_METRICS: 'false',
      VISOMI_OTLP_TRACING: 'false',
      ...changes,
    },
  });
}

it('prepares an existing verified owner without exposing identity or replacing credentials', async () => {
  const before = await fixture.pool.query('SELECT id,email,password_hash,auth_version FROM auth_users ORDER BY id');
  const result = await probe();
  const after = await fixture.pool.query('SELECT id,email,password_hash,auth_version FROM auth_users ORDER BY id');

  expect(JSON.parse(result.stdout)).toEqual({
    prepared: true,
    checks: 'configuration-and-existing-account',
    privateMetrics: false,
    traceExport: false,
    interactiveAcceptanceRequired: true,
  });
  expect(result.stdout).not.toMatch(/example.test|synthetic-owner|argon2|password|[a-f0-9]{8}-/);
  expect(after.rows).toEqual(before.rows);
});

it('fails closed for wrong identity and incomplete configuration with fixed codes only', async () => {
  await expect(probe({ OWNER_USER_ID: '00000000-0000-0000-0000-000000000000' })).rejects.toMatchObject({
    stdout: '{"prepared":false,"code":"owner_identity_mismatch"}\n',
  });

  await expect(probe({ OWNER_EMAIL: '' })).rejects.toMatchObject({
    stdout: '{"prepared":false,"code":"owner_configuration_invalid"}\n',
  });

  await expect(probe({ SMTP_FROM: 'invalid\nheader' })).rejects.toMatchObject({
    stdout: '{"prepared":false,"code":"owner_configuration_invalid"}\n',
  });
});

it('does not treat an unverified account as a prepared owner', async () => {
  const client = await fixture.client();

  await client.call('POST', '/password/sign-up', { email: 'unverified@example.test', password });

  await expect(probe({ OWNER_EMAIL: 'unverified@example.test', OWNER_USER_ID: '' })).rejects.toMatchObject({
    stdout: '{"prepared":false,"code":"owner_identity_unavailable"}\n',
  });
});
