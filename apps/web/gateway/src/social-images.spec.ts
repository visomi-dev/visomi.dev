import { once } from 'node:events';
import type { AddressInfo } from 'node:net';

import express from 'express';

import { createSocialImageRuntime } from './social-images';

const boundary = vi.hoisted(() => ({
  errors: [] as ((error: Error) => void)[],
  waiting: vi.fn(),
  add: vi.fn(),
  close: vi.fn(),
  eventsClose: vi.fn(),
  state: vi.fn(),
  retry: vi.fn(),
  finished: vi.fn(),
  promote: vi.fn(),
  read: vi.fn(),
}));

vi.mock('bullmq', () => ({
  Queue: class {
    getWaitingCount = boundary.waiting;
    add = boundary.add;
    close = boundary.close;

    on(_event: string, handler: (error: Error) => void) {
      boundary.errors.push(handler);

      return this;
    }
  },
  QueueEvents: class {
    close = boundary.eventsClose;

    on(_event: string, handler: (error: Error) => void) {
      boundary.errors.push(handler);

      return this;
    }
  },
}));
vi.mock('@visomi.dev/shared-social-images/promotion', () => ({ promoteSocialImageRun: boundary.promote }));
vi.mock('@visomi.dev/shared-social-images/paths', () => ({ readSocialImageManifest: boundary.read }));
beforeEach(() => {
  vi.resetAllMocks();
  boundary.errors.length = 0;
  vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:1');
  vi.stubEnv('SOCIAL_IMAGE_INTERNAL_TOKEN', 'synthetic-internal-token-32-bytes-long');
  boundary.waiting.mockResolvedValue(0);
  boundary.state.mockResolvedValue('completed');
  boundary.add.mockResolvedValue({
    id: 'synthetic-id',
    getState: boundary.state,
    retry: boundary.retry,
    waitUntilFinished: boundary.finished,
  });
  boundary.finished.mockResolvedValue({ runId: 'synthetic-run' });
  boundary.promote.mockResolvedValue({ copied: [] });
  boundary.read.mockResolvedValue({ runId: 'synthetic-run' });
});
afterEach(() => vi.unstubAllEnvs());

async function fixture() {
  const runtime = createSocialImageRuntime();
  const app = express();

  app.use(runtime.router);
  const server = app.listen(0, '127.0.0.1');

  await once(server, 'listening');

  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    origin,
    async close() {
      server.closeAllConnections();

      await new Promise<void>((done) => server.close(() => done()));

      await runtime.close();
    },
  };
}
const headers = { authorization: 'Bearer synthetic-internal-token-32-bytes-long', 'content-type': 'application/json' };
const data = { runId: 'synthetic-run', target: { locale: 'en', page: 'home' } };

it('fails closed without Redis or a sufficiently strong internal secret', async () => {
  vi.stubEnv('REDIS_URL', '');
  expect(() => createSocialImageRuntime()).toThrow('social_images_unavailable');
  vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:1');
  for (const secret of [undefined, '', 'short', 'synthetic-internal-token-32-bytes-long']) {
    vi.stubEnv('SOCIAL_IMAGE_INTERNAL_TOKEN', secret);
    const app = await fixture();

    try {
      for (const token of ['', 'bad', 'é'.repeat(37), 'x'.repeat('synthetic-internal-token-32-bytes-long'.length)]) {
        const response = await fetch(app.origin + '/page', {
          method: 'POST',
          headers: token ? { authorization: `Bearer ${token}` } : {},
        });

        expect(response.status).toBe(403);
        expect(response.headers.get('cache-control')).toBe('no-store');
      }
    } finally {
      await app.close();
    }
  }
});
it('validates inputs, caps backlog and maps all queue failures to a fixed private response', async () => {
  const app = await fixture();

  const diagnostic = vi.spyOn(console, 'error');

  for (const handler of boundary.errors) {
    handler(new Error('SYNTHETIC_PRIVATE_REDIS'));
  }
  expect(diagnostic).not.toHaveBeenCalled();
  diagnostic.mockRestore();

  try {
    for (const [path, input] of [
      ['/page', {}],
      ['/page?wait=invalid', data],
      ['/website', { targets: Array(11).fill(data.target) }],
    ]) {
      const response = await fetch(app.origin + path, { method: 'POST', headers, body: JSON.stringify(input) });

      expect(response.status).toBe(400);
    }
    boundary.waiting.mockResolvedValueOnce(20);
    const full = await fetch(app.origin + '/page', { method: 'POST', headers, body: JSON.stringify(data) });

    expect(full.status).toBe(429);
    boundary.waiting.mockRejectedValueOnce(new Error('SYNTHETIC_PRIVATE_CONNECTION'));
    const unavailable = await fetch(app.origin + '/page', { method: 'POST', headers, body: JSON.stringify(data) });

    expect(unavailable.status).toBe(503);
    const awaitedResult1 = await unavailable.json();

    expect(awaitedResult1).toEqual({ error: 'social_images_unavailable' });
    boundary.waiting.mockImplementationOnce(() => new Promise(() => undefined));
    const started = Date.now();
    const stalled = await fetch(app.origin + '/page', { method: 'POST', headers, body: JSON.stringify(data) });

    expect(stalled.status).toBe(503);
    expect(Date.now() - started).toBeLessThan(5000);
  } finally {
    await app.close();
  }
});
it('keeps explicit runs idempotent, supports enqueue-only calls and retries failed jobs before promotion', async () => {
  const app = await fixture();

  try {
    const queued = await fetch(app.origin + '/page?wait=false', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    expect(queued.status).toBe(202);
    const awaitedResult2 = await queued.json();

    expect(awaitedResult2).toEqual({ jobId: 'synthetic-id', queued: true });
    boundary.state.mockResolvedValueOnce('failed');
    const generated = await fetch(app.origin + '/website', {
      method: 'POST',
      headers,
      body: JSON.stringify({ targets: [data.target] }),
    });

    expect(generated.status).toBe(200);
    expect(boundary.retry).toHaveBeenCalledOnce();
    expect(boundary.add).toHaveBeenLastCalledWith(
      'generate-website-social-images',
      expect.objectContaining({ runId: expect.any(String) }),
      expect.objectContaining({ attempts: 3, removeOnFail: { count: 100 } }),
    );
  } finally {
    await app.close();
  }
  expect(boundary.close).toHaveBeenCalledOnce();
  expect(boundary.eventsClose).toHaveBeenCalledOnce();
});
it('protects manifest and promotion paths and sanitizes missing or failed storage operations', async () => {
  const app = await fixture();

  try {
    const invalid = await fetch(app.origin + '/runs/bad.id', { headers });

    expect(invalid.status).toBe(400);
    const manifest = await fetch(app.origin + '/runs/synthetic-run', { headers });

    expect(manifest.status).toBe(200);
    boundary.read.mockRejectedValueOnce(new Error('private path'));
    const missing = await fetch(app.origin + '/runs/missing', { headers });

    expect(missing.status).toBe(404);
    const invalidPromotion = await fetch(app.origin + '/runs/bad.id/promote', { method: 'POST', headers });

    expect(invalidPromotion.status).toBe(400);
    const promoted = await fetch(app.origin + '/runs/synthetic-run/promote', { method: 'POST', headers });

    expect(promoted.status).toBe(200);
    boundary.promote.mockRejectedValueOnce(new Error('private path'));
    const failed = await fetch(app.origin + '/runs/missing/promote', { method: 'POST', headers });

    expect(failed.status).toBe(503);
  } finally {
    await app.close();
  }
});
