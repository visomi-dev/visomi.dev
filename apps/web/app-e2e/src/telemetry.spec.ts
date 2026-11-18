import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';

const marker = 'SYNTHETIC_PRIVATE_BROWSER_MARKER';

async function verifyClientRouter(
  application: string,
  page: Page,
  reports: { payload: Record<string, unknown>; status: number }[],
) {
  if (application !== 'web-site') {
    return;
  }

  const configurationRequests: string[] = [];

  page.on('request', (request) => {
    if (request.url().endsWith('/telemetry/config')) {
      configurationRequests.push(request.url());
    }
  });

  await page.getByRole('link', { name: '// JOURNEY', exact: true }).first().click();

  await expect(page).toHaveURL(/\/journey\/$/);

  await page.evaluate(() =>
    window.dispatchEvent(new ErrorEvent('error', { error: new SyntaxError('SYNTHETIC_PRIVATE_BROWSER_MARKER') })),
  );

  await expect.poll(() => reports.length).toBe(3);

  expect(configurationRequests).toHaveLength(0);
}

for (const [path, application] of [
  ['/app/en/admin/auth/sign-in', 'web-app'],
  ['/', 'web-site'],
] as const) {
  test(`${application} captures errors through its compiled entrypoint and stores them in Jaeger`, async ({
    page,
    request,
    baseURL,
    browserName,
  }, info) => {
    const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);
    const previousLog = await readFile(resolve(directory, 'runtime.log'), 'utf8');
    const runtimeErrors: string[] = [];

    page.on('pageerror', (error) => runtimeErrors.push(error.name + ': ' + error.message.slice(0, 200)));
    const reports: { payload: Record<string, unknown>; status: number }[] = [];

    page.on('response', (response) => {
      if (response.url().endsWith('/telemetry/errors')) {
        reports.push({ payload: response.request().postDataJSON(), status: response.status() });
      }
    });

    const configured = page.waitForResponse((response) => response.url().endsWith('/telemetry/config'));

    await page.goto(path + '?private=' + marker);

    const configuration = await configured;
    const config = await configuration.json();

    expect(config.enabled).not.toBe(false);
    expect(config.assets.length).toBeGreaterThan(0);

    await page.evaluate(() => {
      const error = new TypeError('SYNTHETIC_PRIVATE_BROWSER_MARKER');

      for (let index = 0; index < 2; index++) {
        window.dispatchEvent(new ErrorEvent('error', { error }));
      }
      // The event reaches the application's installed listener; no reporter is injected by this test.
      window.dispatchEvent(
        Object.assign(new Event('unhandledrejection'), { reason: new RangeError('SYNTHETIC_PRIVATE_BROWSER_MARKER') }),
      );
    });

    await expect
      .poll(() => ({ kinds: reports.map((report) => report.payload['kind']).sort(), errors: runtimeErrors }))
      .toEqual({ kinds: ['RangeError', 'TypeError'], errors: [] });

    expect(reports.map((report) => report.status)).toEqual([202, 202]);
    expect(reports.every((report) => report.payload['application'] === application)).toBe(true);
    expect(reports.map((report) => report.payload['kind']).sort()).toEqual(['RangeError', 'TypeError']);
    expect(JSON.stringify(reports)).not.toContain(marker);
    for (const { payload } of reports) {
      expect(Object.keys(payload).sort()).toEqual(['application', 'code', 'kind', 'screen']);
    }
    for (const asset of config.assets
      .filter((asset: { path: string }) =>
        application === 'web-app' ? asset.path.startsWith('/app/') : !asset.path.startsWith('/app/'),
      )
      .slice(0, 2)) {
      const map = await request.get(asset.path + '.map');

      expect(map.status()).toBe(404);
      const encoded = await request.get(asset.path + '%2Emap');

      expect(encoded.status()).toBe(404);
    }
    const collectorFile = await readFile(resolve(directory, 'collector.json'), 'utf8');
    const collector = JSON.parse(collectorFile);
    let persisted = '';
    let traceId = '';

    await expect
      .poll(
        async () => {
          const log = await readFile(resolve(directory, 'runtime.log'), 'utf8');
          const lines = log.slice(previousLog.length).trim().split('\n');
          const ids = lines.flatMap((line) => {
            try {
              const entry = JSON.parse(line);

              return entry.event === 'frontend.error' && entry.traceId ? [entry.traceId as string] : [];
            } catch {
              return [];
            }
          });

          for (const id of ids.reverse()) {
            const response = await fetch(`${collector.query}/api/v3/traces/${id}?raw_traces=true`);
            const body = await response.text();

            if (body.includes('frontend.error') && body.includes(application)) {
              persisted = body;
              traceId = id;

              return true;
            }
          }

          return false;
        },
        { timeout: 15000 },
      )
      .toBe(true);

    expect(persisted).not.toContain(marker);
    const log = await readFile(resolve(directory, 'runtime.log'), 'utf8');

    expect(log).not.toContain(marker);

    await verifyClientRouter(application, page, reports);

    const anonymous = await request.get('/api/private/metrics');

    expect(anonymous.status()).toBe(401);
    const fixture = await readFile(resolve(directory, 'session.json'), 'utf8');
    const { cookies } = JSON.parse(fixture) as { cookies: Record<string, string> };

    await page.context().addCookies([
      {
        name: '__Host-visomi.sid',
        value: encodeURIComponent(cookies[`metricsOwner-${browserName}`]),
        url: baseURL!,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      },
    ]);

    const authorized = await page.request.get('/api/private/metrics');
    const snapshot = await authorized.text();

    expect(authorized.status()).toBe(200);
    expect(authorized.headers()['cache-control']).toContain('no-store');
    expect(snapshot).toContain(traceId);
    expect(snapshot).not.toContain(marker);

    await page.goto('/app/en/admin/metrics');

    const details = page.locator('details', { hasText: traceId });

    await details.locator('summary').click();

    await expect(details.getByText(traceId, { exact: true })).toBeVisible();

    await page.screenshot({ path: info.outputPath(`browser-diagnostics-${application}.png`), animations: 'disabled' });
  });
}

test('Angular measures router transitions and page performance without exporting navigation data', async ({ page }) => {
  const reports: Record<string, unknown>[] = [];

  page.on('response', (response) => {
    if (response.url().endsWith('/telemetry/performance') && response.status() === 202) {
      reports.push(response.request().postDataJSON());
    }
  });

  await page.goto('/app/en/admin/auth/sign-in');

  await expect.poll(() => reports.length).toBeGreaterThan(0);

  await page.evaluate(() => {
    history.pushState(null, '', '?private=SYNTHETIC_PRIVATE_ROUTE#SYNTHETIC_PRIVATE_ROUTE');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  await expect
    .poll(
      () =>
        reports
          .flatMap((report) => report['measurements'] as { name: string }[])
          .filter((value) => value.name === 'route_completed').length,
    )
    .toBe(1);

  expect(JSON.stringify(reports)).not.toContain('SYNTHETIC_PRIVATE_ROUTE');
  expect(reports.every((report) => Object.keys(report).sort().join(',') === 'application,measurements,screen')).toBe(
    true,
  );
});

test('disabled capture and failed transports leave sign-in usable and do not loop', async ({ page }) => {
  let reports = 0;

  await page.route('**/telemetry/config', (route) => route.fulfill({ json: { enabled: false } }));

  page.on('request', (request) => {
    if (/\/telemetry\/errors$/.test(request.url())) {
      reports++;
    }
  });

  await page.goto('/app/en/admin/auth/sign-in');

  await page.evaluate(() =>
    window.dispatchEvent(new ErrorEvent('error', { error: new TypeError('SYNTHETIC_PRIVATE_OFF') })),
  );

  await expect(page.getByLabel('Verified email')).toBeVisible();

  await page.getByLabel('Verified email').fill('synthetic@example.test');

  expect(reports).toBe(0);

  await page.unroute('**/telemetry/config');

  await page.route('**/telemetry/errors', (route) => route.abort('failed'));

  await page.reload();

  await page.evaluate(() =>
    window.dispatchEvent(new ErrorEvent('error', { error: new RangeError('SYNTHETIC_PRIVATE_TRANSPORT') })),
  );

  await expect.poll(() => reports).toBe(1);

  await expect(page.getByLabel('Verified email')).toBeVisible();
});
