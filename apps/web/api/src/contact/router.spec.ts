import { createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import express from 'express';

import type { Principal } from '../auth/shared/identity';
import { createApp } from '../app';

import { createContactRouter } from './router';
import type { OwnerConfig } from './owner';
import type { ContactRepository, ContactSubmission } from './repository';

const record: ContactSubmission = {
  id: '1',
  createdAt: '2025-01-01T00:00:00.000Z',
  email: 'sender@example.test',
  name: 'Test Person',
  locale: 'en',
  type: 'other',
  message: '<img src=x onerror=alert(1)>',
};
const owner: Principal = {
  id: 'owner-id',
  method: 'password',
  version: 1,
  authenticatedAt: Date.now(),
  level: 'full',
  emailVerified: true,
  email: 'owner@example.test',
};

async function fixture(
  user?: Principal,
  repository?: ContactRepository,
  config: OwnerConfig = { email: 'owner@example.test' },
  missing = false,
  missingIp = false,
) {
  const storage = repository ?? {
    submit: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([record]),
    detail: vi.fn().mockResolvedValue(record),
    ready: vi.fn().mockResolvedValue(undefined),
  };
  const app = express();

  app.use((request, _response, next) => {
    request.user = user;

    if (missingIp) {
      Object.defineProperty(request, 'ip', { value: undefined });
    }

    next();
  });
  app.use(createContactRouter(missing ? undefined : storage, config));
  const server = createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    storage,
    origin,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

describe('contact API security boundary', () => {
  it.each([
    undefined,
    { ...owner, email: 'non-owner@example.test' },
    { ...owner, emailVerified: false },
    { ...owner, level: 'unverified' as const },
  ])('denies list and direct IDs for unauthorized principals', async (user) => {
    const app = await fixture(user);

    try {
      for (const path of ['/submissions', '/submissions/1', '/session']) {
        const response = await fetch(app.origin + path);

        expect([401, 403]).toContain(response.status);
        expect(response.headers.get('cache-control')).toContain('no-store');
        const awaitedResult1 = await response.text();

        expect(awaitedResult1).not.toContain(record.email);
      }
      expect(app.storage.list).not.toHaveBeenCalled();
      expect(app.storage.detail).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('fails closed when the configured owner is absent', async () => {
    const app = await fixture(owner, undefined, { email: '' });

    try {
      const awaitedResult2 = await fetch(app.origin + '/submissions');

      expect(awaitedResult2.status).toBe(403);
    } finally {
      await app.close();
    }
  });

  it('authorizes the owner, paginates, omits message bodies from the list and returns text in JSON detail', async () => {
    const app = await fixture(owner);

    try {
      const response = await fetch(app.origin + '/submissions?limit=1');

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toContain('no-store');
      const list = await response.json();

      expect(list.items).toHaveLength(1);
      expect(list.items[0]).not.toHaveProperty('message');
      const detail = await fetch(app.origin + '/submissions/1');

      expect(detail.headers.get('content-type')).toContain('application/json');
      const awaitedResult3 = await detail.json();

      expect(awaitedResult3).toEqual({ item: record });
      const awaitedResult4 = await fetch(app.origin + '/submissions/0');

      expect(awaitedResult4.status).toBe(400);
      const awaitedResult5 = await fetch(app.origin + '/submissions?limit=1000');

      expect(awaitedResult5.status).toBe(400);
      const awaitedResult6 = await fetch(app.origin + '/submissions?before=1%20OR%201=1');

      expect(awaitedResult6.status).toBe(400);
      const awaitedResult7 = await fetch(app.origin + '/submissions?unexpected=1');

      expect(awaitedResult7.status).toBe(400);
    } finally {
      await app.close();
    }
  });

  it('validates public input, limits repeated submissions and never returns stored PII', async () => {
    const app = await fixture();
    const { id: _id, createdAt: _createdAt, ...input } = record;
    const post = (body: unknown) =>
      fetch(app.origin + '/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

    try {
      const awaitedResult8 = await post({ ...input, message: 'short' });

      expect(awaitedResult8.status).toBe(422);
      const awaitedResult9 = await post({ ...input, unknown: 'field' });

      expect(awaitedResult9.status).toBe(422);
      const response = await post(input);

      expect(response.status).toBe(201);
      const awaitedResult10 = await response.json();

      expect(awaitedResult10).toEqual({ sent: true });

      await post(input);

      await post(input);

      const awaitedResult11 = await post(input);

      expect(awaitedResult11.status).toBe(429);
    } finally {
      await app.close();
    }
  });

  it('sanitizes database failures and missing IDs', async () => {
    const storage: ContactRepository = {
      submit: vi.fn().mockRejectedValue(new Error('private message and SQL')),
      list: vi.fn().mockRejectedValue(new Error('private credentials')),
      detail: vi.fn().mockResolvedValue(undefined),
      ready: vi.fn(),
    };
    const app = await fixture(owner, storage);

    try {
      const list = await fetch(app.origin + '/submissions');

      expect(list.status).toBe(503);
      const awaitedResult12 = await list.json();

      expect(awaitedResult12).toEqual({ error: 'contact_unavailable' });
      const awaitedResult13 = await fetch(app.origin + '/submissions/1');

      expect(awaitedResult13.status).toBe(404);
      const { id: _id, createdAt: _createdAt, ...input } = record;
      const response = await fetch(app.origin + '/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });

      expect(response.status).toBe(503);
      const awaitedResult14 = await response.text();

      expect(awaitedResult14).not.toContain('private');
    } finally {
      await app.close();
    }
  });
  it('exposes owner session and a numeric cursor while preserving no-store on missing storage and failures', async () => {
    const storage: ContactRepository = {
      submit: vi.fn(),
      list: vi.fn().mockResolvedValue([record, { ...record, id: '2' }]),
      detail: vi.fn().mockRejectedValue(new Error('private')),
      ready: vi.fn(),
    };
    const app = await fixture(owner, storage);

    try {
      const session = await fetch(app.origin + '/session');

      const awaitedResult1 = await session.json();

      expect(awaitedResult1).toEqual({ owner: true });
      const list = await fetch(app.origin + '/submissions?limit=1');

      const awaitedResult2 = await list.json();

      expect(awaitedResult2.next).toBe('1');
      const failed = await fetch(app.origin + '/submissions/1');

      expect(failed.status).toBe(503);
    } finally {
      await app.close();
    }
    const missing = await fixture(owner, undefined, { email: 'owner@example.test' }, true);

    try {
      for (const [path, method] of [
        ['/submissions', 'GET'],
        ['/submissions/1', 'GET'],
        ['/submissions', 'POST'],
      ]) {
        const response = await fetch(missing.origin + path, {
          method,
          ...(method === 'POST'
            ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(recordInput()) }
            : {}),
        });

        expect(response.status).toBe(503);
      }
    } finally {
      await missing.close();
    }
  });

  it('uses only authenticated proxy client keys and returns fixed JSON for malformed or oversized input', async () => {
    vi.stubEnv('CONTACT_PROXY_SECRET', 'synthetic-proxy-secret');
    const app = await fixture();
    const source = 'synthetic-browser';
    const signature = createHmac('sha256', 'synthetic-proxy-secret').update(source).digest('hex');

    try {
      for (const [body, status, signatureValue] of [
        ['{', 400, signature],
        [JSON.stringify({ message: 'x'.repeat(20000) }), 413, '0'.repeat(64)],
        [JSON.stringify(recordInput()), 201, 'invalid'],
      ]) {
        const response = await fetch(app.origin + '/submissions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-contact-client': source,
            'x-contact-signature': String(signatureValue),
          },
          body: String(body),
        });

        expect(response.status).toBe(status);
      }
    } finally {
      await app.close();

      vi.unstubAllEnvs();
    }
  });

  it.each([undefined, true, false])('reports readiness from the actual contact repository: %s', async (state) => {
    const contact: ContactRepository | undefined =
      state === undefined
        ? undefined
        : {
            submit: vi.fn(),
            list: vi.fn(),
            detail: vi.fn(),
            ready: state ? vi.fn().mockResolvedValue(undefined) : vi.fn().mockRejectedValue(new Error('private')),
          };
    const server = createServer(createApp({ contact }));

    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));

    try {
      const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      const response = await fetch(origin + '/ready');

      expect(response.status).toBe(state ? 200 : 503);
      const health = await fetch(origin + '/health');

      expect(health.status).toBe(200);
    } finally {
      server.closeAllConnections();

      await new Promise<void>((done) => server.close(() => done()));
    }
  });
  it('falls back safely without a transport address and forwards unsupported encodings to the host error boundary', async () => {
    const app = await fixture(undefined, undefined, undefined, false, true);

    try {
      const response = await fetch(app.origin + '/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(recordInput()),
      });

      expect(response.status).toBe(201);
      const unsupported = await fetch(app.origin + '/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'content-encoding': 'synthetic-unsupported' },
        body: '{}',
      });

      expect(unsupported.status).toBe(415);
    } finally {
      await app.close();
    }
  });
});

function recordInput() {
  const { id: _id, createdAt: _createdAt, ...input } = record;

  return input;
}
