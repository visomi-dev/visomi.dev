import { once } from 'node:events';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { setImmediate } from 'node:timers/promises';

import { expect, it, vi } from 'vitest';

import { createBrowserConsent } from './consent';
import { trackVisits } from './visit-browser';

const configuration = '/telemetry/visits/config';
const intake = '/telemetry/visits';
const page = { page: 'home', locale: 'en', path: '/private/SYNTHETIC_DATA' } as const;

it('sends only page and locale without credentials or a referrer', async () => {
  const transport = vi.fn<Window['fetch']>().mockResolvedValueOnce(Response.json({ enabled: true }));

  transport.mockResolvedValueOnce(new Response(null, { status: 204 }));
  observeVisit(transport);

  await setImmediate();

  const privacy = { credentials: 'omit', referrerPolicy: 'no-referrer' };

  expect(transport).toHaveBeenCalledTimes(2);
  expect(transport).toHaveBeenNthCalledWith(1, configuration, expect.objectContaining(privacy));
  expect(transport).toHaveBeenNthCalledWith(
    2,
    'https://frontend.example.test' + intake,
    expect.objectContaining({ ...privacy, method: 'POST', keepalive: true, body: '{"page":"home","locale":"en"}' }),
  );
});

it('does not submit a visit when collection is disabled', async () => {
  const transport = vi.fn<Window['fetch']>().mockResolvedValueOnce(Response.json({ enabled: false }));

  observeVisit(transport);

  await setImmediate();

  expect(transport).toHaveBeenCalledExactlyOnceWith(configuration, expect.anything());
});

it.each([configuration, intake])('rejects a redirect from %s without reaching its destination', async (endpoint) => {
  const received: string[] = [];
  const server = createServer((request, response) => {
    received.push(`${request.method} ${request.url}`);
    request.resume();

    if (request.url === endpoint) {
      response.writeHead(307, { location: '/redirect-target' }).end();
    } else {
      response.writeHead(200, { 'content-type': 'application/json' }).end('{"enabled":true}');
    }
  });

  server.listen(0, '127.0.0.1');

  await once(server, 'listening');

  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const transport = vi.fn((path: string | URL | Request, init?: RequestInit) =>
    fetch(new URL(String(path), origin), init),
  );
  const expectedRequests =
    endpoint === configuration ? [`GET ${configuration}`] : [`GET ${configuration}`, `POST ${intake}`];

  try {
    observeVisit(transport, origin);

    await vi.waitFor(() => expect(transport).toHaveBeenCalledTimes(expectedRequests.length));

    await expect(transport.mock.results[expectedRequests.length - 1].value).rejects.toBeInstanceOf(TypeError);

    await setImmediate();

    expect(received).toEqual(expectedRequests);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

function observeVisit(transport: Window['fetch'], origin = 'https://frontend.example.test'): void {
  const browser = {
    fetch: transport,
    document: Object.assign(new EventTarget(), { visibilityState: 'visible', readyState: 'complete' }),
    location: new URL('/home', origin),
    navigator: {},
    addEventListener: () => undefined,
    localStorage: { getItem: () => 'accept:1-2-3-4' },
  } as unknown as Window;

  trackVisits(browser, createBrowserConsent(browser), () => page);
}
