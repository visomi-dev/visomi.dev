import { describe, expect, it, vi } from 'vitest';

import { boundary, start } from '../tests/support/main';

describe('gateway executable ownership', () => {
  const approvals = { origin: 'https://app.example.test' };

  it('uses the configured Redis transport and closes it with the host', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    vi.stubEnv('REALTIME_REDIS_URL', 'redis://synthetic');
    boundary.api.createAuthentication.mockReturnValue({ ...boundary.auth, realtime: approvals });
    const transport = { publish: vi.fn(), subscribe: vi.fn(), close: vi.fn() };

    boundary.redisTransport.mockReturnValue(transport);

    await start();

    expect(transport.subscribe).toHaveBeenCalledOnce();
    const reportFailure = boundary.redisTransport.mock.calls[0][1];

    reportFailure();
    expect(boundary.observability.event).toHaveBeenCalledWith('runtime.failed');
    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    expect(transport.close).toHaveBeenCalledOnce();
  });

  it('does not listen if shutdown begins while subscribing to events', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    vi.stubEnv('REALTIME_REDIS_URL', 'redis://synthetic');
    boundary.api.createAuthentication.mockReturnValue({ ...boundary.auth, realtime: approvals });
    let subscribed!: () => void;
    const subscription = new Promise<void>((resolve) => {
      subscribed = resolve;
    });

    boundary.redisTransport.mockReturnValue({ subscribe: () => subscription, close: vi.fn() });

    await start();

    boundary.signals.get('SIGTERM')!();
    subscribed();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.server.listen).not.toHaveBeenCalled();
  });

  it.each([false, true])('provides a transport-neutral publisher when realtime is enabled=%s', async (enabled) => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    boundary.api.createAuthentication.mockReturnValue({ ...boundary.auth, realtime: enabled ? approvals : undefined });

    await start();

    const { realtimePublisher } = boundary.api.createAuthentication.mock.calls[0][0];

    await realtimePublisher.notifyDeviceApproval('synthetic-request');

    await realtimePublisher.notifySession('synthetic-session');

    await realtimePublisher.notifyUser('synthetic-user');

    expect(boundary.notifyDeviceApproval.mock.calls).toEqual(enabled ? [['synthetic-request']] : []);
    expect(boundary.notifySession.mock.calls).toEqual(enabled ? [['synthetic-session']] : []);
    expect(boundary.notifyUser.mock.calls).toEqual(enabled ? [['synthetic-user']] : []);
  });

  it.each([false, true])('closes upgraded connections before the database when close fails=%s', async (fails) => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    boundary.api.createAuthentication.mockReturnValue({ ...boundary.auth, realtime: approvals });

    if (fails) {
      boundary.closeRealtime.mockRejectedValue(new Error('SYNTHETIC_CLOSE_FAILURE'));
    }

    await start();

    expect(boundary.loadRealtime.mock.calls[0][0].pathname).toMatch(/\/realtime\/app.js$/);
    expect(boundary.attachRealtime).toHaveBeenCalledWith(boundary.server, approvals);
    expect(boundary.attachRealtime.mock.invocationCallOrder[0]).toBeLessThan(
      boundary.server.listen.mock.invocationCallOrder[0],
    );
    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.closeRealtime.mock.invocationCallOrder[0]).toBeLessThan(
      boundary.database.close.mock.invocationCallOrder[0],
    );
    expect(boundary.server.close).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(fails ? 1 : 0);
  });

  it('does not attach realtime if shutdown begins while loading the factory', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    boundary.api.createAuthentication.mockReturnValue({ ...boundary.auth, realtime: approvals });
    let loaded!: (module: { attachRealtimeServer: typeof boundary.attachRealtime }) => void;

    boundary.loadRealtime.mockReturnValue(new Promise((resolve) => (loaded = resolve)));

    await start();

    boundary.signals.get('SIGTERM')!();
    loaded({ attachRealtimeServer: boundary.attachRealtime });

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.attachRealtime).not.toHaveBeenCalled();
    expect(boundary.server.listen).not.toHaveBeenCalled();
  });

  it.each([undefined, 'https://frontend.example.test'])(
    'owns opt-in browser telemetry using origin %s',
    async (origin) => {
      vi.stubEnv('VISOMI_BROWSER_TELEMETRY', 'true');
      vi.stubEnv('BROWSER_TELEMETRY_ORIGIN', origin);

      await start();

      expect(boundary.browserAssets).toHaveBeenCalledWith(boundary.site.clientDirectory);
      expect(boundary.browserTelemetry).toHaveBeenCalledWith({
        observability: boundary.observability,
        assets: { 'web-site': new Map(), 'web-app': new Map() },
        origin: origin ?? 'https://visomi.dev',
        performance: false,
      });
      expect(boundary.createGatewayApp).toHaveBeenCalledWith(
        expect.objectContaining({
          browserTelemetry: {
            context: 'synthetic-context',
            router: 'synthetic-router',
            close: boundary.closeBrowserTelemetry,
          },
        }),
      );
      boundary.signals.get('SIGTERM')!();

      await vi.advanceTimersByTimeAsync(0);

      expect(boundary.closeBrowserTelemetry).toHaveBeenCalledOnce();
    },
  );

  it('still captures Angular errors when the website is unavailable', async () => {
    vi.stubEnv('VISOMI_BROWSER_TELEMETRY', 'true');
    boundary.loadSite.mockResolvedValue(undefined);

    await start();

    expect(boundary.browserTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ assets: { 'web-app': new Map() } }),
    );
  });
  it('forwards the explicit browser performance opt-in to the shared intake', async () => {
    vi.stubEnv('VISOMI_BROWSER_TELEMETRY', 'true');
    vi.stubEnv('VISOMI_BROWSER_PERFORMANCE', 'true');

    await start();

    expect(boundary.browserTelemetry).toHaveBeenCalledWith(expect.objectContaining({ performance: true }));
  });
  it('does not create intake resources after shutdown while the asset allowlist is loading', async () => {
    let loaded!: (assets: Map<string, unknown>) => void;

    vi.stubEnv('VISOMI_BROWSER_TELEMETRY', 'true');
    boundary.browserAssets.mockReturnValue(
      new Promise((resolve) => {
        loaded = resolve;
      }),
    );

    await start();

    boundary.signals.get('SIGTERM')!();
    loaded(new Map());

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.browserTelemetry).not.toHaveBeenCalled();
    expect(boundary.server.listen).not.toHaveBeenCalled();
  });
  it('uses default networking and the adjacent compiled API when no overrides are configured', async () => {
    vi.stubEnv('HOST', undefined);
    vi.stubEnv('PORT', undefined);
    vi.stubEnv('API_APP_PATH', '');
    vi.stubEnv('SITE_APP_PATH', '');
    vi.stubEnv('APPLICATION_APP_PATH', '');

    await start();

    expect(boundary.server.listen).toHaveBeenCalledWith(3000, 'localhost', expect.any(Function));
    expect(boundary.loadApi.mock.calls[0][0].pathname).toMatch(/\/api\/app.js$/);
    expect(boundary.loadSite.mock.calls[0][0].pathname).toMatch(/\/site\/server\/entry.mjs$/);
    expect(boundary.loadApplication.mock.calls[0][0].pathname).toMatch(/\/app\/server\/server.mjs$/);
  });

  it.each([false, true])('does not fail startup if optional Nx readiness fails: %s', async (fails) => {
    vi.stubEnv('NX_READY_SIGNAL_SOCKET', '/synthetic/ready.sock');

    if (fails) {
      boundary.ready.mockImplementation(() => {
        throw new Error('SYNTHETIC_OPTIONAL_READY');
      });
    }

    await start();

    await boundary.server.listen.mock.calls[0][2]();

    expect(boundary.ready).toHaveBeenCalledWith(boundary.server);
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.started');
  });

  it('reports an idle pool failure using only a controlled operational event', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');

    await start();

    boundary.createDatabase.mock.calls[0][1]();
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.failed');
  });

  it('handles listener failure and an unsuccessful telemetry flush', async () => {
    await start();

    boundary.observability.shutdown.mockResolvedValue(false);
    boundary.events.get('error')!();

    await vi.advanceTimersByTimeAsync(0);

    expect(process.exitCode).toBe(1);
    expect(boundary.observability.event).toHaveBeenCalledWith('runtime.failed', 'startup_failed');
  });

  it('does not restart shutdown when module loading rejects after a signal', async () => {
    let reject!: (error: Error) => void;

    boundary.loadApi.mockReturnValue(
      new Promise((_resolve, failed) => {
        reject = failed;
      }),
    );

    await start();

    boundary.signals.get('SIGTERM')!();
    reject(new Error('SYNTHETIC_LATE_IMPORT_FAILURE'));

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.server.close).toHaveBeenCalledOnce();
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.stopped', 'none');
  });
  it('loads the compiled public API and initializes one host runtime', async () => {
    await start();

    expect(boundary.initialize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ service: 'web-gateway' }));
    expect(boundary.loadApi.mock.calls[0][0].href).toBe('file:///synthetic/compiled/api/app.js');
    expect(boundary.createGatewayApp).toHaveBeenCalledWith({
      api: boundary.api,
      site: boundary.site,
      application: boundary.application,
      auth: undefined,
      observability: boundary.observability,
    });
    expect(boundary.server.on).toHaveBeenCalledWith('request', 'synthetic-app');
    expect(boundary.server.listen).toHaveBeenCalledWith(3456, '127.0.0.1', expect.any(Function));
    expect(boundary.createDatabase).not.toHaveBeenCalled();
    boundary.server.listen.mock.calls[0][2]();
    expect(boundary.observability.event).toHaveBeenCalledWith('runtime.started');
  });

  it('creates one pool and passes the API-owned authentication chain to the host', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    vi.stubEnv('AUTH_TRUST_PROXY', '127.0.0.1, ::1');

    await start();

    expect(boundary.database.pool.query).toHaveBeenCalledExactlyOnceWith('SELECT 1');
    expect(boundary.api.createAuthentication).toHaveBeenCalledExactlyOnceWith({
      database: boundary.database.db,
      pool: boundary.database.pool,
      config: {},
      realtimePublisher: expect.any(Object),
    });
    expect(boundary.createGatewayApp).toHaveBeenCalledWith(
      expect.objectContaining({ auth: boundary.auth, trustProxy: ['127.0.0.1', '::1'] }),
    );
    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.database.close).toHaveBeenCalledOnce();
    expect(boundary.database.close.mock.invocationCallOrder[0]).toBeLessThan(
      boundary.observability.shutdown.mock.invocationCallOrder[0],
    );
  });

  it.each(['SIGTERM', 'SIGINT'])('drains and flushes exactly once on repeated %s', async (signal) => {
    await start();

    boundary.signals.get(signal)!();
    boundary.signals.get(signal)!();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.server.close).toHaveBeenCalledOnce();
    expect(boundary.observability.shutdown).toHaveBeenCalledExactlyOnceWith(1000);
    expect(process.exitCode).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('sanitizes failed module loading without opening a port', async () => {
    boundary.loadApi.mockRejectedValue(new Error('SYNTHETIC_PRIVATE_PATH'));

    await start();

    expect(boundary.server.listen).not.toHaveBeenCalled();
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.failed', 'startup_failed');
    expect(process.exitCode).toBe(1);
  });

  it('rejects invalid networking configuration before importing the API', async () => {
    vi.stubEnv('PORT', 'invalid');

    await start();

    expect(boundary.loadApi).not.toHaveBeenCalled();
    expect(boundary.server.listen).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('closes an owned pool after failed database startup', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    boundary.database.pool.query.mockRejectedValue(new Error('SYNTHETIC_PRIVATE_DATABASE'));

    await start();

    expect(boundary.database.close).toHaveBeenCalledOnce();
    expect(boundary.server.listen).not.toHaveBeenCalled();
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.failed', 'startup_failed');
    expect(process.exitCode).toBe(1);
  });

  it('flushes telemetry even when database cleanup fails', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');

    await start();

    boundary.database.close.mockRejectedValue(new Error('SYNTHETIC_PRIVATE_DATABASE'));
    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.observability.shutdown).toHaveBeenCalledOnce();
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.failed', 'shutdown_failed');
    expect(process.exitCode).toBe(1);
  });

  it('does not create resources after shutdown interrupts module loading', async () => {
    let resolve: (api: typeof boundary.api) => void = () => undefined;

    boundary.loadApi.mockReturnValue(
      new Promise((ready) => {
        resolve = ready;
      }),
    );

    await start();

    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    resolve(boundary.api);

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.createDatabase).not.toHaveBeenCalled();
    expect(boundary.server.listen).not.toHaveBeenCalled();
  });

  it('does not listen when database connectivity finishes after shutdown', async () => {
    let resolve: () => void = () => undefined;

    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    boundary.database.pool.query.mockReturnValue(
      new Promise<void>((ready) => {
        resolve = ready;
      }),
    );

    await start();

    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    resolve();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.database.close).toHaveBeenCalledOnce();
    expect(boundary.server.listen).not.toHaveBeenCalled();
  });

  it('enforces the drain and shutdown deadlines', async () => {
    boundary.server.close.mockImplementation(() => undefined);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await start();

    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(3000);

    expect(boundary.server.closeAllConnections).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(2000);

    expect(exit).toHaveBeenCalledWith(1);
    expect(boundary.observability.event).toHaveBeenCalledExactlyOnceWith('runtime.failed', 'shutdown_timeout');
  });
});

it.each([false, true])(
  'closes its owned SMTP transport and still closes PostgreSQL after SMTP failure: %s',
  async (fails) => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
    vi.stubEnv('GOOGLE_AUTH_CLIENT_ID', 'synthetic-client');
    vi.stubEnv('AUTH_TOTP_ENCRYPTION_KEY', 'synthetic-key');
    boundary.smtpConfig.mockReturnValue({ host: 'smtp.example.test' });

    if (fails) {
      boundary.smtp.close.mockImplementation(() => {
        throw new Error('synthetic_smtp_close_failure');
      });
    }

    await import('./main');

    await vi.advanceTimersByTimeAsync(0);

    boundary.signals.get('SIGTERM')!();

    await vi.advanceTimersByTimeAsync(0);

    expect(boundary.createSmtp).toHaveBeenCalledOnce();
    expect(boundary.smtp.close).toHaveBeenCalledOnce();
    expect(boundary.database.close).toHaveBeenCalledOnce();
    expect(boundary.observability.event).toHaveBeenCalledWith(
      fails ? 'runtime.failed' : 'runtime.stopped',
      fails ? 'shutdown_failed' : 'none',
    );
  },
);

it.each(['signal', 'worker-exit', 'spawn-error', 'queue-close-error', 'deadline'] as const)(
  'owns the social worker and closes all resources under %s',
  async (mode) => {
    vi.stubEnv('DISABLE_WORKER', 'false');

    await start();

    expect(boundary.spawn).toHaveBeenCalledOnce();
    expect(boundary.createGatewayApp).toHaveBeenCalledWith(
      expect.objectContaining({ socialImages: 'synthetic-router' }),
    );

    if (mode === 'queue-close-error') {
      boundary.socialClose.mockRejectedValue(new Error('SYNTHETIC_PRIVATE_REDIS'));
    }

    if (mode === 'worker-exit') {
      boundary.worker.exitCode = 1;
      for (const callback of boundary.workerCallbacks.get('exit') ?? []) {
        callback();
      }
    } else if (mode === 'spawn-error') {
      for (const callback of boundary.workerCallbacks.get('error') ?? []) {
        callback();
      }
    } else {
      if (mode === 'deadline') {
        boundary.worker.kill.mockImplementation(() => false);
      }

      boundary.signals.get('SIGTERM')!();
    }

    if (mode === 'deadline') {
      const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await vi.advanceTimersByTimeAsync(5000);

      expect(boundary.worker.kill).toHaveBeenCalledWith('SIGKILL');
      expect(exit).toHaveBeenCalledWith(1);
    } else {
      await vi.advanceTimersByTimeAsync(0);

      expect(boundary.socialClose).toHaveBeenCalledOnce();
      expect(boundary.observability.shutdown).toHaveBeenCalledOnce();
      expect(process.exitCode).toBe(mode === 'signal' ? 0 : 1);
    }
  },
);
it('keeps contact persistence separate from unavailable owner authentication', async () => {
  vi.stubEnv('DATABASE_URL', 'postgresql://synthetic/unused');
  vi.stubEnv('OWNER_EMAIL', '');

  await start();

  expect(boundary.createDatabase).toHaveBeenCalledOnce();
  expect(boundary.api.createAuthentication).not.toHaveBeenCalled();
  expect(boundary.server.listen).toHaveBeenCalledOnce();
});
