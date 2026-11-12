import { spawn, type ChildProcess } from 'node:child_process';
import { createHmac, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { SMTPServer } from 'smtp-server';
import { hashPassword } from '@visomi-stack/dev-testing/lib/password';
import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';

import { createDatabase } from '@visomi-stack/backend-shared/lib/database/database';

// Test-only executable. Owns an isolated Compose project; never reads ambient DATABASE_URL or .env.
async function main(): Promise<void> {
  const port = Number(process.env['VISOMI_E2E_PORT'] ?? 8183);

  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('fixture_port_invalid');
  }

  const runtime = process.env['VISOMI_E2E_RUNTIME'] ?? 'web-gateway';

  if (!['web-gateway', 'web-api'].includes(runtime)) {
    throw new Error('fixture_runtime_invalid');
  }

  const origin = `http://127.0.0.1:${port}`;
  const directory = resolve('tmp', `browser-fixture-${port}`);

  await mkdir(directory, { recursive: true });

  const postgres = await testPostgres();
  const database = createDatabase(postgres.url);
  const secret = 'synthetic-browser-session-secret-more-than-32-bytes';
  let child: ChildProcess | undefined;
  let stopping = false;
  const smtp = new SMTPServer({
    disabledCommands: ['AUTH', 'STARTTLS'],
    logger: false,
    onData(stream, _session, callback) {
      let raw = '';

      stream.on('data', (chunk) => {
        raw += String(chunk);
      });
      stream.on('end', () => {
        const code = raw.match(/\b\d{6}\b/)?.[0];

        void writeFile(resolve(directory, 'mail.json'), JSON.stringify({ code }), { mode: 0o600 }).then(
          () => callback(),
          () => callback(new Error('synthetic_delivery_failed')),
        );
      });
    },
  });
  const stop = async () => {
    if (stopping) {
      return;
    }

    stopping = true;
    child?.kill('SIGTERM');

    await new Promise<void>((done) => smtp.close(done));

    await database.close();

    await postgres.stop();
  };

  process.once('SIGINT', () => void stop());
  process.once('SIGTERM', () => void stop());

  try {
    await new Promise<void>((done) => smtp.listen(0, '127.0.0.1', done));

    const smtpPort = ((smtp as unknown as { server: Server }).server.address() as AddressInfo).port;
    const password = await hashPassword('Synthetic password 42!');
    const cookies: Record<string, string> = {};

    for (const role of ['owner', 'other']) {
      const id = randomUUID();

      await database.pool.query(
        'INSERT INTO auth_users (id,email,email_verified_at,password_hash) VALUES ($1,$2,now(),$3)',
        [id, `${role}@example.test`, password],
      );

      // Inbox tests revoke their session; metrics keep an independent session for the same synthetic owner.
      for (const sessionRole of role === 'owner' ? ['owner', 'metricsOwner'] : ['other']) {
        const sid = randomUUID();
        const expire = new Date(Date.now() + 8 * 60 * 60_000);
        const session = {
          cookie: {
            originalMaxAge: 8 * 60 * 60_000,
            expires: expire.toISOString(),
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
          },
          passport: { user: { id, method: 'password', authenticatedAt: Date.now(), version: 1, level: 'full' } },
        };

        await database.pool.query('INSERT INTO auth_sessions (sid,sess,expire) VALUES ($1,$2,$3)', [
          sid,
          session,
          expire,
        ]);

        const signature = createHmac('sha256', secret).update(sid).digest('base64').replace(/=+$/, '');

        cookies[sessionRole] = `s:${sid}.${signature}`;
      }
    }
    for (let index = 1; index <= 26; index++) {
      await database.pool.query(
        "INSERT INTO contact_submissions(email,locale,message,name,type) VALUES($1,'en',$2,$3,'other')",
        [`request-${index}@example.test`, 'Synthetic pagination message', `Synthetic request ${index}`],
      );
    }

    await writeFile(resolve(directory, 'session.json'), JSON.stringify({ cookies }), { mode: 0o600 });

    child = spawn(
      process.execPath,
      [runtime === 'web-api' ? 'dist/apps/web/api/main.js' : 'dist/apps/web/gateway/main.js'],
      {
        stdio: 'inherit',
        env: {
          PATH: process.env['PATH'],
          NODE_ENV: 'production',
          VISOMI_PRIVATE_METRICS: process.env['VISOMI_E2E_PRIVATE_METRICS'] ?? 'false',
          HOST: '127.0.0.1',
          PORT: String(port),
          DATABASE_URL: postgres.url,
          AUTH_ORIGIN: origin,
          AUTH_RP_ID: '127.0.0.1',
          SESSION_SECRET: secret,
          OWNER_EMAIL: 'owner@example.test',
          DISABLE_WORKER: 'true',
          SMTP_HOST: '127.0.0.1',
          SMTP_PORT: String(smtpPort),
          SMTP_FROM: 'auth@example.test',
          SMTP_ALLOW_INSECURE_LOCAL: 'true',
          ASTRO_TELEMETRY_DISABLED: '1',
          VISOMI_OTLP_TRACING: 'false',
          VISOMI_BROWSER_TELEMETRY: 'false',
          VISOMI_BROWSER_PERFORMANCE: 'false',
        },
      },
    );
    child.once('exit', () => {
      if (!stopping) {
        process.exitCode = 1;
        void stop();
      }
    });
    for (let attempt = 0; ; attempt++) {
      const ready = await fetch(`${origin}${runtime === 'web-api' ? '' : '/api'}/ready`).then(
        (response) => response.ok,
        () => false,
      );

      if (ready) {
        break;
      }

      if (attempt >= 100 || stopping) {
        throw new Error('fixture_startup_failed');
      }

      await delay(100);
    }
    process.stdout.write('[fixture ready]\n');
  } catch {
    process.exitCode = 1;

    await stop();

    process.stderr.write('browser_fixture_failed\n');
  }
}

void main().catch(() => {
  process.stderr.write('browser_fixture_failed\n');
  process.exitCode = 1;
});
