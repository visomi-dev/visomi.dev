#!/usr/bin/env tsx
import { createServer } from 'node:http';

// @nx-target-name: serve

import { createDatabase } from '@visomi-stack/backend-shared/lib/database/database';
import { createRealtimePublisher } from '@visomi-stack/backend-shared/lib/realtime';
import { createRedisRealtimeTransport } from '@visomi-stack/backend-shared/lib/realtime-redis';
import { createSmtp, smtpConfig } from '@visomi-stack/backend-shared/lib/mail/smtp';
import type { MailTransport } from '@visomi-stack/backend-shared/lib/mail/smtp';
import type { DatabaseResource } from '@visomi-stack/backend-shared/lib/database/database';
import type { RealtimeTransport } from '@visomi-stack/backend-shared/lib/realtime';
import { emitReadySignal } from '@visomi-stack/web-backend-shared/lib/http/readiness';
import { initializeObservability } from '@visomi-stack/web-backend-shared/lib/observability/lib/observability';

import packageJson from '../package.json' with { type: 'json' };

import { authConfig, createApp, createAuthentication } from './app';
import type { AuthRuntime } from './auth/runtime';

const observability = initializeObservability({
  service: 'web-api',
  version: packageJson.version,
  environment: process.env.NODE_ENV,
});
let database: DatabaseResource | undefined;
let mail: MailTransport | undefined;
let auth: AuthRuntime | undefined;
let realtimeTransport: RealtimeTransport | undefined;
let startupFailed = false;
let application: ReturnType<typeof createApp> | undefined;

try {
  if (process.env.DATABASE_URL) {
    database = createDatabase(process.env.DATABASE_URL, () => observability.event('runtime.failed'));

    if (process.env.AUTH_ORIGIN && process.env.AUTH_RP_ID && process.env.SESSION_SECRET && process.env.OWNER_EMAIL) {
      const config = authConfig({
        origin: process.env.AUTH_ORIGIN!,
        rpId: process.env.AUTH_RP_ID!,
        secret: process.env.SESSION_SECRET!,
        googleClientId: process.env.GOOGLE_AUTH_CLIENT_ID || undefined,
        totpKey: process.env.AUTH_TOTP_ENCRYPTION_KEY || undefined,
      });

      const smtp = smtpConfig(process.env);

      mail = smtp ? createSmtp(smtp) : undefined;

      if (process.env.REALTIME_REDIS_URL) {
        realtimeTransport = createRedisRealtimeTransport(process.env.REALTIME_REDIS_URL, () =>
          observability.event('runtime.failed'),
        );
      }

      auth = createAuthentication({
        database: database.db,
        pool: database.pool,
        config,
        mail,
        ...(realtimeTransport ? { realtimePublisher: createRealtimePublisher(realtimeTransport) } : {}),
      });
    }
  }

  application = createApp({
    pool: database?.pool,
    observability,
    ...(auth ? { auth } : {}),
    ...(process.env.AUTH_TRUST_PROXY
      ? { trustProxy: process.env.AUTH_TRUST_PROXY.split(',').map((value) => value.trim()) }
      : {}),
  });
} catch {
  startupFailed = true;
}

const server = createServer(application ?? createApp({ observability }));
let stopping = false;

async function stop(exitCode: number): Promise<void> {
  if (stopping) {
    return;
  }

  stopping = true;
  process.off('SIGINT', onSignal);
  process.off('SIGTERM', onSignal);
  const deadline = setTimeout(() => {
    observability.event('runtime.failed', 'shutdown_timeout');
    process.exit(1);
  }, 5000);
  const drain = setTimeout(() => server.closeAllConnections(), 3000);

  await new Promise<void>((resolve) => server.close(() => resolve()));

  clearTimeout(drain);
  realtimeTransport?.close();
  let databaseClosed = true;

  try {
    mail?.close();
  } catch {
    databaseClosed = false;
  }

  try {
    await database?.close();
  } catch {
    databaseClosed = false;
  }
  observability.event(
    !databaseClosed || exitCode ? 'runtime.failed' : 'runtime.stopped',
    !databaseClosed ? 'shutdown_failed' : exitCode ? 'startup_failed' : 'none',
  );
  const flushed = await observability.shutdown(1000);

  clearTimeout(deadline);
  process.exitCode = flushed && databaseClosed ? exitCode : 1;
}

function onSignal(): void {
  void stop(0);
}

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
server.once('error', () => void stop(1));

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);

if (startupFailed || !Number.isInteger(port) || port < 0 || port > 65535) {
  void stop(1);
} else {
  const listen = () => {
    if (stopping) {
      return;
    }

    server.listen(port, host, async () => {
      observability.event('runtime.started');

      if (process.env.NX_READY_SIGNAL_SOCKET) {
        try {
          emitReadySignal(server);
        } catch {
          // Nx readiness is optional for standalone execution.
        }
      }
    });
  };

  if (database) {
    void database.pool
      .query('SELECT 1')
      .then(listen)
      .catch(() => stop(1));
  } else {
    listen();
  }
}
