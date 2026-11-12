import { once } from 'node:events';
import type { AddressInfo } from 'node:net';

import express from 'express';

import { createGatewayApp } from '../../src/app';

it.each([false, true])(
  'passes only trusted client identity to Astro contact throttling (proxy=%s)',
  async (trusted) => {
    const app = createGatewayApp({
      api: { createApp: () => express(), authConfig: () => ({}), createAuthentication: () => ({ middleware: [] }) },
      site: {
        clientDirectory: '/synthetic/absent-site',
        handler: (request, response) => response.json({ address: request.headers['x-forwarded-for'] }),
      },
      ...(trusted ? { trustProxy: ['127.0.0.1'] } : {}),
    });
    const server = app.listen(0, '127.0.0.1');

    await once(server, 'listening');

    try {
      const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/`, {
        headers: { 'x-forwarded-for': '192.0.2.30' },
      });
      const body = await response.json();

      expect(body.address).toBe(trusted ? '192.0.2.30' : '127.0.0.1');
    } finally {
      server.closeAllConnections();

      await new Promise<void>((done) => server.close(() => done()));
    }
  },
);
