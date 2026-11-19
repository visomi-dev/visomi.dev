import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { SMTPServer } from 'smtp-server';
import { hashPassword } from '@visomi-stack/dev-testing/lib/password';
import { testPostgres } from '@visomi-stack/dev-testing/lib/postgres';
import { runFixture } from '@visomi-stack/dev-testing/lib/fixture-lifetime';

import { createDatabase } from '@visomi-stack/backend-shared/lib/database/database';

import { browserHttps } from './browser-https';
import { browserCollector } from './browser-collector';

// Test-only executable. Owns an isolated Compose project; never reads ambient DATABASE_URL or .env.
let phase = 'configuration';

async function main(): Promise<void> {
  await runFixture(async ({ signal, onCleanup, stop }) => {
    const port = Number(process.env['VISOMI_E2E_PORT'] ?? 8183);

    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      throw new Error('fixture_port_invalid');
    }

    const runtime = process.env['VISOMI_E2E_RUNTIME'] ?? 'web-gateway';

    if (!['web-gateway', 'web-api'].includes(runtime)) {
      throw new Error('fixture_runtime_invalid');
    }

    const tls = process.env['VISOMI_E2E_HTTPS'] === 'true';
    const runtimePort = tls ? port + 100 : port;
    const origin = tls ? `https://visomi.dev:${port}` : `http://127.0.0.1:${port}`;
    const directory = resolve('tmp', `browser-fixture-${port}`);

    await mkdir(directory, { recursive: true });

    const resources: {
      postgres?: Awaited<ReturnType<typeof testPostgres>>;
      database?: ReturnType<typeof createDatabase>;
      child?: ChildProcess;
    } = {};
    const secret = 'synthetic-browser-session-secret-more-than-32-bytes';
    let proxy: Awaited<ReturnType<typeof browserHttps>> | undefined;
    let collector: Awaited<ReturnType<typeof browserCollector>> | undefined;
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

    onCleanup(async () => {
      if (resources.child && resources.child.exitCode === null && resources.child.signalCode === null) {
        const exited = once(resources.child, 'exit', { signal: AbortSignal.timeout(10000) });

        resources.child.kill('SIGTERM');

        await exited.catch(() => {
          resources.child?.kill('SIGKILL');
        });
      }

      const results = await Promise.allSettled([
        new Promise<void>((done) => smtp.close(done)),
        resources.database?.close(),
        resources.postgres?.stop(),
        collector?.stop(),
        proxy?.stop(),
      ]);

      if (results.some((result) => result.status === 'rejected')) {
        process.exitCode = 1;
        process.stderr.write('browser_fixture_cleanup_failed\n');
      }
    });

    phase = 'postgres';
    const postgres = await testPostgres(undefined, 'postgres', signal);

    resources.postgres = postgres;
    const database = createDatabase(postgres.url);

    resources.database = database;
    signal.throwIfAborted();

    if (tls) {
      phase = 'tls';
      const created = await browserHttps(directory, port, runtimePort);

      proxy = created;
    }

    if (process.env['VISOMI_E2E_PRIVATE_COLLECTOR'] === 'true') {
      phase = 'collector';
      const createdCollector = await browserCollector(signal);

      collector = createdCollector;

      await writeFile(resolve(directory, 'collector.json'), JSON.stringify({ query: collector.query }));
    }

    signal.throwIfAborted();
    phase = 'seed';

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
      for (const sessionRole of (role === 'owner'
        ? [
            'owner',
            'metricsOwner',
            'syncOwner',
            'focusOwner',
            'realtimeOwner',
            'lateOwner',
            'logoutNetworkOwner',
            'logoutServerOwner',
            'detailExpiryOwner',
            'paginationFocusOwner',
            'detailFocusOwner',
            'csrfOwner',
          ]
        : ['other']
      ).flatMap((name) => [name, ...['chromium', 'firefox', 'webkit'].map((browser) => `${name}-${browser}`)])) {
        const sid = randomUUID();
        const expire = new Date(Date.now() + 8 * 60 * 60_000);
        const session = {
          csrf: randomBytes(32).toString('base64url'),
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

    await writeFile(resolve(directory, 'runtime.log'), '');

    signal.throwIfAborted();
    phase = 'runtime';
    const child = spawn(
      process.execPath,
      [runtime === 'web-api' ? 'dist/apps/web/api/main.js' : 'dist/apps/web/gateway/main.js'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          PATH: process.env['PATH'],
          NODE_ENV: 'production',
          VISOMI_PRIVATE_METRICS: process.env['VISOMI_E2E_PRIVATE_METRICS'] ?? 'false',
          HOST: '127.0.0.1',
          PORT: String(runtimePort),
          NODE_EXTRA_CA_CERTS: proxy?.certificate,
          NODE_OPTIONS: tls ? '--import ./tools/testing/browser-dns.mjs' : undefined,
          AUTH_TRUST_PROXY: tls ? '1-hop' : undefined,
          DATABASE_URL: postgres.url,
          AUTH_ORIGIN: origin,
          AUTH_RP_ID: tls ? 'visomi.dev' : '127.0.0.1',
          SESSION_SECRET: secret,
          OWNER_EMAIL: 'owner@example.test',
          DISABLE_WORKER: 'true',
          SMTP_HOST: '127.0.0.1',
          SMTP_PORT: String(smtpPort),
          SMTP_FROM: 'auth@example.test',
          SMTP_ALLOW_INSECURE_LOCAL: 'true',
          ASTRO_TELEMETRY_DISABLED: '1',
          OTEL_EXPORTER_OTLP_ENDPOINT: collector?.receiver,
          OTEL_EXPORTER_OTLP_PROTOCOL: collector ? 'http/protobuf' : undefined,
          OTEL_EXPORTER_OTLP_HEADERS: collector?.headers,
        },
      },
    );

    resources.child = child;
    for (const stream of [child.stdout, child.stderr]) {
      stream?.on('data', (chunk) => {
        void appendFile(resolve(directory, 'runtime.log'), chunk);
      });
    }
    child.once('exit', () => {
      if (!signal.aborted) {
        process.exitCode = 1;
        stop();
      }
    });
    for (let attempt = 0; ; attempt++) {
      signal.throwIfAborted();
      const ready = await fetch(`http://127.0.0.1:${runtimePort}${runtime === 'web-api' ? '' : '/api'}/ready`, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]),
      }).then(
        (response) => response.ok,
        () => false,
      );

      if (ready) {
        break;
      }

      if (attempt >= 100 || signal.aborted) {
        throw new Error('fixture_startup_failed');
      }

      await delay(100, undefined, { signal });
    }
    process.stdout.write('[fixture ready]\n');
  });
}

void main().catch((error: unknown) => {
  const detail =
    error instanceof Error &&
    /^isolated_postgres_(?:setup_failed:(?:provider|start|port|readiness|migration)(?::(?:timeout|cancelled))?|cleanup_failed:(?:isolated_command_(?:timeout|aborted|failed|output_limit)|provider_error))$/.test(
      error.message,
    )
      ? ':' + error.message
      : '';

  process.stderr.write(`browser_fixture_failed:${phase}${detail}\n`);
  process.exitCode = 1;
});
