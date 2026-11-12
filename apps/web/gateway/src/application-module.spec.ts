import { once } from 'node:events';
import { createServer, request as nodeRequest } from 'node:http';
import type { AddressInfo } from 'node:net';

import express from 'express';
import { describe, expect, it, vi } from 'vitest';

import { httpErrorHandler } from '@visomi-stack/web-backend-shared/lib/http/http-error-handler';

import { loadApplication, resolveApplicationModule } from './application-module';

// Cold compiled SSR imports and bootstrap run under coverage on shared CI CPUs.
const compiledSsrTimeout = 30000;

describe('compiled Angular boundary', () => {
  it('accepts the composition factory without invoking it', () => {
    const createApp = vi.fn();
    const application = { createApp, clientDirectory: '/synthetic/app/browser' };

    expect(resolveApplicationModule(application)).toBe(application);
    expect(createApp).not.toHaveBeenCalled();
  });

  it.each([
    null,
    false,
    {},
    { createApp: 1 },
    { createApp: () => undefined },
    { createApp: () => undefined, clientDirectory: 1 },
  ])('rejects invalid composition exports', (namespace) => {
    expect(() => resolveApplicationModule(namespace)).toThrow('application_module_invalid');
  });

  it.each([
    'https://example.invalid/server/server.mjs',
    'file:///synthetic/app/src/server.ts',
    'file:///synthetic/app/server/standalone.mjs',
    'file:///synthetic/app/server/server.mjs?other=1',
    'file:///synthetic/app/server/server.mjs#other',
  ])('rejects remote, source, executable and modified entry points', async (entry) => {
    await expect(loadApplication(new URL(entry))).rejects.toThrow('application_entry_invalid');
  });

  it(
    'imports the real compiled factory without opening a runtime or adding shutdown handlers',
    async () => {
      const signals = [process.listenerCount('SIGTERM'), process.listenerCount('SIGINT')];
      const runtime = (globalThis as Record<symbol, unknown>)[Symbol.for('visomi-stack.observability.v1')];
      const application = await loadApplication(
        new URL('../../../../dist/apps/web/app/server/server.mjs', import.meta.url),
      );

      expect(typeof application.createApp).toBe('function');
      expect(application.clientDirectory).toMatch(/\/dist\/apps\/web\/app\/browser$/);
      expect([process.listenerCount('SIGTERM'), process.listenerCount('SIGINT')]).toEqual(signals);
      expect((globalThis as Record<symbol, unknown>)[Symbol.for('visomi-stack.observability.v1')]).toBe(runtime);
    },
    compiledSsrTimeout,
  );
  it(
    'rejects private host material without logging it and leaves process failures with the executable',
    async () => {
      const application = await loadApplication(
        new URL('../../../../dist/apps/web/app/server/server.mjs', import.meta.url),
      );
      const before = [process.listenerCount('unhandledRejection'), process.listenerCount('uncaughtException')];
      const parent = express();

      parent.use(application.createApp({ errorMode: 'inherited', helmetMode: 'inherited' }));
      const server = createServer(parent);
      const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      server.listen(0, '127.0.0.1');

      await once(server, 'listening');

      const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

      try {
        const rendered = await fetch(origin + '/app/en/');

        await rendered.text();

        expect(rendered.status).toBe(200);
        expect([process.listenerCount('unhandledRejection'), process.listenerCount('uncaughtException')]).toEqual(
          before,
        );
        const rejected = await new Promise<{ status: number; body: string }>((resolve, reject) => {
          const request = nodeRequest(
            origin + '/app/en/?private=SYNTHETIC_PRIVATE_QUERY',
            {
              headers: { host: 'SYNTHETIC_PRIVATE_HOST.example.test' },
            },
            (response) => {
              let body = '';

              response.on('data', (chunk) => {
                body += String(chunk);
              });
              response.on('end', () => resolve({ status: response.statusCode!, body }));
            },
          );

          request.on('error', reject);
          request.end();
        });

        expect(rejected.status).toBe(400);
        expect(JSON.parse(rejected.body)).toEqual({ error: 'request_invalid' });
        expect(errors).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();

        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
    compiledSsrTimeout,
  );
  it.each([
    ['valid Railway origin', {}, 200],
    ['missing proto', { 'x-forwarded-proto': undefined }, 400],
    ['missing forwarded host', { 'x-forwarded-host': undefined }, 400],
    ['foreign host', { 'x-forwarded-host': 'attacker.invalid' }, 400],
    ['loopback', { 'x-forwarded-host': '127.0.0.1' }, 400],
    ['HTTP scheme', { 'x-forwarded-proto': 'http' }, 400],
    ['invalid scheme', { 'x-forwarded-proto': 'javascript' }, 400],
    ['host list', { 'x-forwarded-host': 'visomi.dev,attacker.invalid' }, 400],
    ['duplicate host', { 'x-forwarded-host': ['visomi.dev', 'visomi.dev'] }, 400],
    ['foreign port', { 'x-forwarded-host': 'visomi.dev:8080' }, 400],
    ['userinfo', { 'x-forwarded-host': 'user@visomi.dev' }, 400],
    ['foreign raw host', { host: 'localhost' }, 400],
    ['untrusted Forwarded cannot override origin', { forwarded: 'host=attacker.invalid;proto=http' }, 200],
    ['XFF is not trusted', { 'x-forwarded-for': '192.0.2.123' }, 200],
  ])(
    'configures compiled SSR safely: %s',
    async (_name, overrides, expected) => {
      const application = await loadApplication(
        new URL('../../../../dist/apps/web/app/server/server.mjs', import.meta.url),
      );

      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('AUTH_ORIGIN', 'https://visomi.dev');
      const parent = express();

      try {
        parent.use(application.createApp({ errorMode: 'inherited', helmetMode: 'inherited' }));
      } finally {
        vi.unstubAllEnvs();
      }
      parent.use(httpErrorHandler);
      const server = createServer(parent);
      const warnings = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      server.listen(0, '127.0.0.1');

      await once(server, 'listening');

      try {
        const status = await new Promise<number>((resolve, reject) => {
          const request = nodeRequest(
            {
              host: '127.0.0.1',
              port: (server.address() as AddressInfo).port,
              path: '/app/en/',
              headers: Object.fromEntries(
                Object.entries({
                  host: 'visomi.dev',
                  'x-forwarded-host': 'visomi.dev',
                  'x-forwarded-proto': 'https',
                  ...overrides,
                }).filter(([, value]) => value !== undefined),
              ),
            },
            (response) => {
              response.resume();
              response.on('end', () => resolve(response.statusCode!));
            },
          );

          request.on('error', reject);
          request.end();
        });

        expect(status).toBe(expected);

        if ('x-forwarded-for' in overrides || 'forwarded' in overrides) {
          expect(warnings).toHaveBeenCalled();
        } else {
          expect(warnings).not.toHaveBeenCalled();
        }
      } finally {
        warnings.mockRestore();

        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
    compiledSsrTimeout,
  );

  it.each([undefined, 'http://visomi.dev', 'https://localhost', 'https://visomi.dev/other'])(
    'rejects invalid production SSR origin %s',
    async (origin) => {
      const application = await loadApplication(
        new URL('../../../../dist/apps/web/app/server/server.mjs', import.meta.url),
      );

      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('AUTH_ORIGIN', origin);

      try {
        expect(() => application.createApp({ errorMode: 'inherited', helmetMode: 'inherited' })).toThrow(
          'ssr_public_origin_invalid',
        );
      } finally {
        vi.unstubAllEnvs();
      }
    },
    compiledSsrTimeout,
  );
});
