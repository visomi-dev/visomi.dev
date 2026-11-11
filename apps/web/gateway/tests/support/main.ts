import type * as MockModule3 from '@visomi-stack/backend-shared/lib/database/database';
import type * as MockModule4 from '@visomi-stack/backend-shared/lib/mail/smtp';
import type * as MockModule5 from '@visomi-stack/backend-shared/lib/realtime-redis';
import { afterEach, beforeEach, vi } from 'vitest';

const boundary = vi.hoisted(() => ({
  signals: new Map<string, () => void>(),
  events: new Map<string, () => void>(),
  server: {
    address: vi.fn(),
    once: vi.fn(),
    on: vi.fn(),
    listen: vi.fn(),
    close: vi.fn(),
    closeAllConnections: vi.fn(),
  },
  observability: { event: vi.fn(), shutdown: vi.fn() },
  database: { db: {}, pool: { query: vi.fn() }, close: vi.fn() },
  api: { authConfig: vi.fn(), createAuthentication: vi.fn(), createApp: vi.fn() },
  auth: { middleware: [] },
  initialize: vi.fn(),
  createDatabase: vi.fn(),
  smtpConfig: vi.fn(),
  createSmtp: vi.fn(),
  smtp: { send: vi.fn(), close: vi.fn() },
  createServer: vi.fn(),
  createGatewayApp: vi.fn(),
  loadApi: vi.fn(),
  loadSite: vi.fn(),
  loadApplication: vi.fn(),
  loadRealtime: vi.fn(),
  attachRealtime: vi.fn(),
  closeRealtime: vi.fn(),
  notifyDeviceApproval: vi.fn(),
  notifySession: vi.fn(),
  notifyUser: vi.fn(),
  redisTransport: vi.fn(),
  application: { createApp: vi.fn(), clientDirectory: '/synthetic/app/browser' },
  browserAssets: vi.fn(),
  browserTelemetry: vi.fn(),
  closeBrowserTelemetry: vi.fn(),
  site: { handler: vi.fn(), clientDirectory: '/synthetic/site/client' },
  ready: vi.fn(),
  spawn: vi.fn(),
  socialRuntime: vi.fn(),
  socialClose: vi.fn(),
  workerCallbacks: new Map<string, (() => void)[]>(),
  worker: { exitCode: null as number | null, once: vi.fn(), kill: vi.fn() },
}));

vi.mock('node:child_process', () => ({ spawn: boundary.spawn }));
vi.mock('../../src/social-images', () => ({ createSocialImageRuntime: boundary.socialRuntime }));

vi.mock('node:http', () => ({ createServer: boundary.createServer }));
vi.mock('@visomi-stack/web-backend-shared/lib/observability/lib/observability', () => ({
  initializeObservability: boundary.initialize,
  browserAssets: boundary.browserAssets,
  createBrowserTelemetry: boundary.browserTelemetry,
}));
vi.mock('@visomi-stack/web-backend-shared/lib/observability/browser/assets', () => ({
  initializeObservability: boundary.initialize,
  browserAssets: boundary.browserAssets,
  createBrowserTelemetry: boundary.browserTelemetry,
}));
vi.mock('@visomi-stack/web-backend-shared/lib/observability/browser/intake', () => ({
  initializeObservability: boundary.initialize,
  browserAssets: boundary.browserAssets,
  createBrowserTelemetry: boundary.browserTelemetry,
}));
vi.mock('@visomi-stack/backend-shared/lib/database/database', async (original) => {
  const shared = await original<typeof MockModule3>();

  return {
    ...shared,
    createRedisRealtimeTransport: boundary.redisTransport,
    createDatabase: boundary.createDatabase,
    smtpConfig: boundary.smtpConfig,
    createSmtp: boundary.createSmtp,
  };
});
vi.mock('@visomi-stack/backend-shared/lib/mail/smtp', async (original) => {
  const shared = await original<typeof MockModule4>();

  return {
    ...shared,
    createRedisRealtimeTransport: boundary.redisTransport,
    createDatabase: boundary.createDatabase,
    smtpConfig: boundary.smtpConfig,
    createSmtp: boundary.createSmtp,
  };
});
vi.mock('@visomi-stack/backend-shared/lib/realtime-redis', async (original) => {
  const shared = await original<typeof MockModule5>();

  return {
    ...shared,
    createRedisRealtimeTransport: boundary.redisTransport,
    createDatabase: boundary.createDatabase,
    smtpConfig: boundary.smtpConfig,
    createSmtp: boundary.createSmtp,
  };
});
vi.mock('../../src/api-module', () => ({ loadApi: boundary.loadApi }));
vi.mock('../../src/site-module', () => ({ loadSite: boundary.loadSite }));
vi.mock('../../src/application-module', () => ({ loadApplication: boundary.loadApplication }));
vi.mock('../../src/realtime-module', () => ({ loadRealtime: boundary.loadRealtime }));
vi.mock('../../src/app', () => ({ createGatewayApp: boundary.createGatewayApp }));
vi.mock('@visomi-stack/web-backend-shared/lib/http/readiness', () => ({ emitReadySignal: boundary.ready }));

vi.mock('@visomi-stack/web-backend-shared/lib/http/document-policy', () => ({ prepareDocumentPolicy: vi.fn() }));

const originalExitCode = process.exitCode;

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.stubEnv('DATABASE_URL', '');
  vi.stubEnv('DISABLE_WORKER', 'true');
  vi.stubEnv('OWNER_EMAIL', 'owner@example.test');
  vi.stubEnv('AUTH_ORIGIN', 'http://127.0.0.1:3456');
  vi.stubEnv('AUTH_RP_ID', '127.0.0.1');
  vi.stubEnv('SESSION_SECRET', 'synthetic-session-secret-more-than-32-bytes');
  vi.stubEnv('REALTIME_REDIS_URL', '');
  vi.stubEnv('API_APP_PATH', '/synthetic/compiled/api/app.js');
  vi.stubEnv('SITE_APP_PATH', '/synthetic/compiled/site/server/entry.mjs');
  vi.stubEnv('APPLICATION_APP_PATH', '/synthetic/compiled/app/server/server.mjs');
  vi.stubEnv('AUTH_TRUST_PROXY', '');
  vi.stubEnv('HOST', '127.0.0.1');
  vi.stubEnv('PORT', '3456');
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('NX_READY_SIGNAL_SOCKET', '');
  vi.stubEnv('VISOMI_BROWSER_TELEMETRY', '');
  vi.stubEnv('VISOMI_BROWSER_PERFORMANCE', '');
  vi.stubEnv('BROWSER_TELEMETRY_ORIGIN', undefined);
  boundary.browserAssets.mockResolvedValue(new Map());
  boundary.browserTelemetry.mockReturnValue({
    context: 'synthetic-context',
    router: 'synthetic-router',
    close: boundary.closeBrowserTelemetry,
  });
  boundary.worker.exitCode = null;
  boundary.workerCallbacks.clear();
  boundary.worker.once.mockImplementation((event: string, callback: () => void) => {
    boundary.workerCallbacks.set(event, [...(boundary.workerCallbacks.get(event) ?? []), callback]);

    return boundary.worker;
  });
  boundary.worker.kill.mockImplementation(() => {
    boundary.worker.exitCode = 0;
    for (const callback of boundary.workerCallbacks.get('exit') ?? []) {
      callback();
    }

    return true;
  });
  boundary.spawn.mockReturnValue(boundary.worker);
  boundary.socialClose.mockResolvedValue(undefined);
  boundary.socialRuntime.mockReturnValue({ router: 'synthetic-router', close: boundary.socialClose });
  boundary.signals.clear();
  boundary.events.clear();
  boundary.initialize.mockReturnValue(boundary.observability);
  boundary.createDatabase.mockReturnValue(boundary.database);
  boundary.smtpConfig.mockReturnValue(undefined);
  boundary.createSmtp.mockReturnValue(boundary.smtp);
  boundary.smtp.close.mockImplementation(() => undefined);
  boundary.database.pool.query.mockResolvedValue({ rows: [] });
  boundary.database.close.mockResolvedValue(undefined);
  boundary.observability.shutdown.mockResolvedValue(true);
  boundary.api.authConfig.mockReturnValue({});
  boundary.api.createAuthentication.mockReturnValue(boundary.auth);
  boundary.loadApi.mockResolvedValue(boundary.api);
  boundary.loadSite.mockResolvedValue(boundary.site);
  boundary.loadApplication.mockResolvedValue(boundary.application);
  boundary.loadRealtime.mockResolvedValue({ attachRealtimeServer: boundary.attachRealtime });
  boundary.attachRealtime.mockReturnValue({
    close: boundary.closeRealtime,
    notifyDeviceApproval: boundary.notifyDeviceApproval,
    notifySession: boundary.notifySession,
    notifyUser: boundary.notifyUser,
  });
  boundary.closeRealtime.mockResolvedValue(undefined);
  boundary.createGatewayApp.mockReturnValue('synthetic-app');
  boundary.createServer.mockReturnValue(boundary.server);
  boundary.server.address.mockReturnValue({ address: '127.0.0.1', family: 'IPv4', port: 3456 });
  boundary.server.once.mockImplementation((name, callback) => boundary.events.set(name, callback));
  boundary.server.close.mockImplementation((callback) => callback());
  vi.spyOn(process, 'once').mockImplementation((name, callback) => {
    boundary.signals.set(String(name), callback as () => void);

    return process;
  });
  vi.spyOn(process, 'off').mockReturnValue(process);
});

afterEach(() => {
  process.exitCode = originalExitCode;
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

async function start() {
  await import('../../src/main');

  await vi.advanceTimersByTimeAsync(0);
}

export { boundary, start };
