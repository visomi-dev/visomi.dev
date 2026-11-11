import { randomBytes } from 'node:crypto';
// @nx-target-name: serve
import type { AddressInfo } from 'node:net';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';

import { prepareDocumentPolicy } from '@visomi-stack/web-backend-shared/lib/http/document-policy';
import { emitReadySignal } from '@visomi-stack/web-backend-shared/lib/http/readiness';
import { createDatabase } from '@visomi-stack/backend-shared/lib/database/database';
import {
  createMemoryRealtimeTransport,
  createRealtimePublisher,
  subscribeRealtime,
} from '@visomi-stack/backend-shared/lib/realtime';
import { createRedisRealtimeTransport } from '@visomi-stack/backend-shared/lib/realtime-redis';
import { createSmtp, smtpConfig } from '@visomi-stack/backend-shared/lib/mail/smtp';
import type { MailTransport } from '@visomi-stack/backend-shared/lib/mail/smtp';
import type { DatabaseResource } from '@visomi-stack/backend-shared/lib/database/database';
import type { RealtimeRuntime } from '@visomi-stack/backend-shared/lib/realtime';
import { browserAssets } from '@visomi-stack/web-backend-shared/lib/observability/browser/assets';
import { createBrowserTelemetry } from '@visomi-stack/web-backend-shared/lib/observability/browser/intake';
import { initializeObservability } from '@visomi-stack/web-backend-shared/lib/observability/lib/observability';

import packageJson from '../package.json' with { type: 'json' };

import { loadApi } from './api-module';
import { contactProxyUrl } from './contact-proxy';
import { createSocialImageRuntime } from './social-images';
import type { EmbeddedAuthentication } from './api-module';
import { createGatewayApp } from './app';
import { loadSite } from './site-module';
import { loadApplication } from './application-module';
import { loadRealtime } from './realtime-module';

const observability = initializeObservability({
  service: 'web-gateway',
  version: packageJson.version,
  environment: process.env.NODE_ENV,
});
let database: DatabaseResource | undefined;
let mail: MailTransport | undefined;
let auth: EmbeddedAuthentication | undefined;
let realtime: RealtimeRuntime | undefined;
let realtimeTransport = createMemoryRealtimeTransport();
const server = createServer();
let stopping = false;
let socialImages: ReturnType<typeof createSocialImageRuntime> | undefined;
let worker: ChildProcess | undefined;
let browserTelemetry: ReturnType<typeof createBrowserTelemetry> | undefined;

async function stop(exitCode: number): Promise<void> {
  if (stopping) {
    return;
  }

  stopping = true;
  process.off('SIGINT', onSignal);
  process.off('SIGTERM', onSignal);
  const deadline = setTimeout(() => {
    worker?.kill('SIGKILL');
    observability.event('runtime.failed', 'shutdown_timeout');
    process.exit(1);
  }, 5000);
  const drain = setTimeout(() => server.closeAllConnections(), 3000);

  let listenerClosed = true;

  try {
    if (worker && worker.exitCode === null) {
      const workerExit = new Promise<void>((done) => worker!.once('exit', () => done()));

      worker.kill('SIGTERM');

      await workerExit;
    }

    await socialImages?.close();
  } catch {
    listenerClosed = false;
  }

  realtimeTransport.close();

  try {
    if (realtime) {
      await realtime.close();
    } else {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  } catch {
    listenerClosed = false;
  }

  clearTimeout(drain);
  let databaseClosed = true;

  try {
    browserTelemetry?.close();
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
    !listenerClosed || !databaseClosed || exitCode ? 'runtime.failed' : 'runtime.stopped',
    !listenerClosed || !databaseClosed ? 'shutdown_failed' : exitCode ? 'startup_failed' : 'none',
  );
  const flushed = await observability.shutdown(1000);

  clearTimeout(deadline);
  process.exitCode = flushed && listenerClosed && databaseClosed ? exitCode : 1;
}

function onSignal(): void {
  void stop(0);
}

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
server.once('error', () => void stop(1));

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);

async function bootstrap() {
  process.env['CONTACT_PROXY_SECRET'] = randomBytes(32).toString('hex');
  process.env['CONTACT_API_URL'] = `http://127.0.0.1:${port}/api/contact/submissions`;

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('gateway_configuration_invalid');
  }

  const entry = process.env.API_APP_PATH
    ? pathToFileURL(resolve(process.env.API_APP_PATH))
    : new URL('../api/app.js', import.meta.url);
  const siteEntry = process.env.SITE_APP_PATH
    ? pathToFileURL(resolve(process.env.SITE_APP_PATH))
    : new URL('../site/server/entry.mjs', import.meta.url);
  const applicationEntry = process.env.APPLICATION_APP_PATH
    ? pathToFileURL(resolve(process.env.APPLICATION_APP_PATH))
    : new URL('../app/server/server.mjs', import.meta.url);
  const [api, site, angular] = await Promise.all([
    loadApi(entry),
    loadSite(siteEntry),
    loadApplication(applicationEntry),
  ]);

  if (stopping) {
    return;
  }

  if (site) {
    await prepareDocumentPolicy(site.clientDirectory);
  }

  if (process.env.DATABASE_URL) {
    if (process.env.REALTIME_REDIS_URL) {
      realtimeTransport = createRedisRealtimeTransport(process.env.REALTIME_REDIS_URL, () =>
        observability.event('runtime.failed'),
      );
    }

    database = createDatabase(process.env.DATABASE_URL, () => observability.event('runtime.failed'));

    if (process.env.AUTH_ORIGIN && process.env.AUTH_RP_ID && process.env.SESSION_SECRET && process.env.OWNER_EMAIL) {
      const config = api.authConfig({
        origin: process.env.AUTH_ORIGIN!,
        rpId: process.env.AUTH_RP_ID!,
        secret: process.env.SESSION_SECRET!,
        googleClientId: process.env.GOOGLE_AUTH_CLIENT_ID || undefined,
        totpKey: process.env.AUTH_TOTP_ENCRYPTION_KEY || undefined,
      });

      const smtp = smtpConfig(process.env);

      mail = smtp ? createSmtp(smtp) : undefined;
      auth = api.createAuthentication({
        database: database.db,
        pool: database.pool,
        config,
        mail,
        realtimePublisher: createRealtimePublisher(realtimeTransport),
      });
    }

    await database.pool.query('SELECT 1');
  }

  if (stopping) {
    return;
  }

  if (process.env.VISOMI_BROWSER_TELEMETRY === 'true') {
    const [applicationAssets, siteAssets] = await Promise.all([
      browserAssets(angular.clientDirectory, '/app'),
      site ? browserAssets(site.clientDirectory) : Promise.resolve(undefined),
    ]);

    if (stopping) {
      return;
    }

    browserTelemetry = createBrowserTelemetry({
      observability,
      assets: { 'web-app': applicationAssets, ...(siteAssets ? { 'web-site': siteAssets } : {}) },
      origin: process.env.BROWSER_TELEMETRY_ORIGIN ?? 'https://visomi.dev',
      performance: process.env.VISOMI_BROWSER_PERFORMANCE === 'true',
    });
  }

  if (process.env['DISABLE_WORKER'] !== 'true') {
    socialImages = createSocialImageRuntime();
    worker = spawn(process.execPath, [fileURLToPath(new URL('../../worker/main.js', import.meta.url))], {
      env: process.env,
      stdio: 'inherit',
    });
    worker.once('error', () => {
      worker = undefined;
      void stop(1);
    });
    worker.once('exit', () => {
      if (!stopping) {
        void stop(1);
      }
    });
  }

  const application = createGatewayApp({
    socialImages: socialImages?.router,
    api,
    pool: database?.pool,
    site,
    application: angular,
    auth,
    observability,
    ...(browserTelemetry ? { browserTelemetry } : {}),
    ...(process.env.AUTH_TRUST_PROXY
      ? { trustProxy: process.env.AUTH_TRUST_PROXY.split(',').map((value) => value.trim()) }
      : {}),
  });

  server.on('request', application);

  if (auth?.realtime) {
    const module = await loadRealtime(new URL('../realtime/app.js', import.meta.url));

    if (stopping) {
      return;
    }

    realtime = module.attachRealtimeServer(server, auth.realtime);

    await subscribeRealtime(realtimeTransport, realtime);
  }

  if (stopping) {
    return;
  }

  server.listen(port, host, async () => {
    process.env['CONTACT_API_URL'] = contactProxyUrl(server.address() as AddressInfo);
    observability.event('runtime.started');

    if (process.env.NX_READY_SIGNAL_SOCKET) {
      try {
        emitReadySignal(server);
      } catch {
        // Nx readiness is optional for standalone execution.
      }
    }
  });
}

void bootstrap().catch(() => {
  if (!stopping) {
    void stop(1);
  }
});
