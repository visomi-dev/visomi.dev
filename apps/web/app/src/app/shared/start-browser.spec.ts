import { afterEach, expect, it, vi } from 'vitest';

import { BROWSER_ERROR_REPORTER } from './observability/browser-telemetry';
import { startBrowser } from './start-browser';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('reports a rejected application bootstrap once through the same function used by the real entrypoint', async () => {
  const transport = vi.fn().mockResolvedValue(new Response(undefined, { status: 202 }));

  transport.mockResolvedValueOnce(Response.json({ token: 'synthetic-token', assets: [] }));
  const browser = Object.assign(new EventTarget(), {
    fetch: transport,
    location: new URL('https://frontend.example.test/app/en/admin/auth/sign-in'),
  });

  vi.stubGlobal('ngDevMode', false);
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const bootstrap = vi.fn().mockRejectedValue(new TypeError('SYNTHETIC_PRIVATE_BOOTSTRAP'));

  await startBrowser(bootstrap, { providers: [] }, browser as unknown as Window);

  expect(bootstrap).toHaveBeenCalledExactlyOnceWith({
    providers: [expect.objectContaining({ provide: BROWSER_ERROR_REPORTER })],
  });

  expect(transport).toHaveBeenCalledTimes(2);
  const payload = JSON.parse(transport.mock.calls[1][1].body);

  expect(payload).toEqual({ application: 'web-app', code: 'startup_failed', kind: 'TypeError', screen: 'unknown' });
  expect(log).not.toHaveBeenCalled();
});
