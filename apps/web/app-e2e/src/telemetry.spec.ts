import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';

const marker = 'SYNTHETIC_PRIVATE_BROWSER_MARKER';

async function allowSharing(page: Page) {
  await page.goto('/privacy/');

  await page.getByRole('button', { name: 'Share', exact: true }).click();

  await expect(page.getByRole('status')).toHaveText('Automatic sharing is on.');
}

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

    await allowSharing(page);

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

    await expect(page.getByRole('heading', { name: 'Technical metrics' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Technical metrics' })).not.toBeFocused();

    const details = page.locator('details', { hasText: traceId });
    const summary = details.locator('summary');
    const trace = details.getByText(traceId, { exact: true });

    await expect(trace).toBeHidden();

    await summary.getByText('Report details', { exact: true }).click();

    await expect(trace).toBeVisible();

    await expect(details).toContainText('Reproduce the affected action if the error repeats or interrupts a task.');

    await expect(details).not.toContainText(marker);

    await summary.focus();

    await expect(summary).toBeFocused();

    await page.keyboard.press('Enter');

    await expect(trace).toBeHidden();

    await expect(summary).toBeFocused();

    await page.keyboard.press('Space');

    await expect(trace).toBeVisible();

    await details.screenshot({
      path: info.outputPath(`browser-diagnostics-${application}.png`),
      animations: 'disabled',
    });
  });
}

test('Angular measures router transitions and page performance without exporting navigation data', async ({ page }) => {
  const reports: Record<string, unknown>[] = [];

  page.on('response', (response) => {
    if (response.url().endsWith('/telemetry/performance') && response.status() === 202) {
      reports.push(response.request().postDataJSON());
    }
  });

  await allowSharing(page);

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

  await allowSharing(page);

  await page.goto('/app/en/admin/auth/sign-in');

  await page.evaluate(() =>
    window.dispatchEvent(new ErrorEvent('error', { error: new RangeError('SYNTHETIC_PRIVATE_TRANSPORT') })),
  );

  await expect.poll(() => reports).toBe(1);

  await expect(page.getByLabel('Verified email')).toBeVisible();
});

for (const testCase of [
  {
    path: '/?synthetic=discard#fixture',
    application: 'web-site',
    locale: 'en',
    label: 'Error report available',
    reject: 'No thanks',
    sent: 'Report sent.',
    discard: 'Discard',
    send: 'Send this report',
    screen: 'home',
    width: 1365,
    theme: 'light',
  },
  {
    path: '/app/es/admin/auth/sign-in?synthetic=discard#fixture',
    application: 'web-app',
    locale: 'es',
    label: 'Reporte de error disponible',
    reject: 'No compartir',
    sent: 'Reporte enviado.',
    discard: 'Descartar',
    send: 'Enviar este reporte',
    screen: 'admin_sign_in',
    width: 375,
    theme: 'dark',
  },
] as const) {
  const { path, application, locale, label, reject, sent } = testCase;

  test(`${application} previews, discards, expires and sends one error without enabling automatic sharing`, async ({
    page,
    baseURL,
    request,
    browserName,
  }, info) => {
    const sharing: string[] = [];

    page.on('request', (entry) => {
      const { pathname } = new URL(entry.url());

      if (pathname.startsWith('/telemetry/')) {
        sharing.push(pathname);
      }
    });

    await page.clock.install();

    await page.setViewportSize({ width: testCase.width, height: 820 });

    await page.emulateMedia({ colorScheme: testCase.theme });

    await page.goto(path);

    const choice = page.getByRole('button', { name: reject, exact: true });

    await expect(choice).toBeVisible();

    await choice.focus();

    await page.keyboard.press('Enter');

    const capture = () =>
      page.evaluate(() => {
        window.dispatchEvent(new ErrorEvent('error', { error: new ReferenceError('SYNTHETIC_PRIVATE_REPORT') }));
        window.dispatchEvent(new ErrorEvent('error', { error: new RangeError('SYNTHETIC_PRIVATE_REPORT') }));
      });

    await capture();

    const open = page.getByRole('button', { name: label });

    await expect(open).toBeVisible();

    await open.focus();

    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    const discard = dialog.getByRole('button', { name: testCase.discard });

    await expect(dialog).toBeVisible();

    await expect(dialog.getByText('ReferenceError', { exact: true })).toBeVisible();

    await expect(dialog).not.toContainText(/SYNTHETIC_PRIVATE_REPORT|synthetic=discard/);

    expect(sharing).toEqual([]);
    const accessibility = await new AxeBuilder({ page }).analyze();

    expect(accessibility.violations).toEqual([]);

    await page.screenshot({ path: info.outputPath(`manual-report-${locale}.png`), animations: 'disabled' });

    await discard.first().click();

    await expect(dialog.getByText('ReferenceError', { exact: true })).toBeHidden();

    expect(sharing).toEqual([]);

    const response = page.waitForResponse((entry) => entry.url().endsWith('/telemetry/errors'));

    await dialog.getByRole('button', { name: testCase.send }).click();

    const accepted = await response;

    expect(accepted.status()).toBe(202);
    const headers = await accepted.request().allHeaders();

    expect(headers['origin']).toBe(new URL(baseURL!).origin);
    expect(headers['cookie']).toBeUndefined();
    expect(headers['referer']).toBeUndefined();
    expect(accepted.request().postDataJSON()).toEqual({
      application,
      code: 'unhandled_exception',
      kind: 'RangeError',
      screen: testCase.screen,
    });

    await expect(dialog.getByRole('status')).toHaveText(sent);

    const decision = await page.evaluate(() => localStorage.getItem('visomi:browser-consent:v1'));

    expect(decision).toBe('reject');

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();

    await capture();

    await expect(open).toBeVisible();

    await page.clock.fastForward('05:01');

    await expect(open).toBeHidden();

    expect(sharing).toEqual(['/telemetry/config', '/telemetry/errors']);

    const anonymous = await request.get('/api/private/metrics');

    expect(anonymous.status()).toBe(401);
    const fixture = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`, 'session.json');
    const fixtureContent = await readFile(fixture, 'utf8');
    const { cookies } = JSON.parse(fixtureContent) as { cookies: Record<string, string> };
    const session = (role: string) => ({
      headers: { cookie: `__Host-visomi.sid=${encodeURIComponent(cookies[`${role}-${browserName}`])}` },
    });
    const forbidden = await request.get('/api/private/metrics', session('other'));

    expect(forbidden.status()).toBe(403);
    const metrics = await request.get('/api/private/metrics', session('metricsOwner'));
    const snapshot = await metrics.json();

    expect(metrics.headers()['cache-control']).toContain('no-store');
    expect(JSON.stringify(snapshot)).not.toContain('SYNTHETIC_PRIVATE_REPORT');
    const report = snapshot.browserErrors.events.find(
      (event: Record<string, unknown>) =>
        event['kind'] === 'RangeError' && event['application'] === application && event['traceId'],
    );

    expect(report?.traceId).toMatch(/^[a-f0-9]{32}$/);
    const collectorContent = await readFile(resolve(fixture, '../collector.json'), 'utf8');
    const collector = JSON.parse(collectorContent);
    const query = new URL(collector.query);

    expect(query.hostname).toBe('127.0.0.1');
    const storedTrace = async () => {
      const trace = await fetch(`${query.origin}/api/v3/traces/${report.traceId}?raw_traces=true`);
      const body = await trace.text();

      return {
        status: trace.status,
        stored: body.includes('frontend.error'),
        redacted: !body.includes('SYNTHETIC_PRIVATE_REPORT'),
      };
    };

    await expect.poll(storedTrace).toEqual({ status: 200, stored: true, redacted: true });
  });
}

test('expected invalid credentials and a public 404 do not queue manual reports', async ({ page }) => {
  const public404 = await page.goto('/es/synthetic-page-not-found/');

  expect(public404?.status()).toBe(404);

  await expect(page.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/es/privacy/');

  await expect(page.getByRole('button', { name: 'Reporte de error disponible' })).toBeHidden();

  await page.goto('/app/es/admin/auth/sign-in');

  await page.getByLabel('Correo verificado').fill('unknown@example.test');

  await page.getByLabel('Contraseña', { exact: true }).fill('SYNTHETIC_INVALID_PASSWORD');

  await page.getByRole('button', { name: 'Continuar', exact: true }).click();

  await expect(page.getByRole('alert')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Reporte de error disponible' })).toBeHidden();
});

for (const [setting, value] of [
  ['globalPrivacyControl', true],
  ['doNotTrack', '1'],
] as const) {
  test(`automatic sharing respects ${setting} even with a stored grant`, async ({ page }) => {
    await page.addInitScript(
      ({ privacy, value }) => {
        localStorage.setItem('visomi:browser-consent:v1', 'accept:1-2-3-4');
        Object.defineProperty(navigator, privacy, { value });
      },
      { privacy: setting, value },
    );

    const outbound: string[] = [];

    page.on('request', (entry) => {
      if (new URL(entry.url()).pathname.startsWith('/telemetry/')) {
        outbound.push(entry.url());
      }
    });

    await page.goto('/es/privacy/');

    await expect(page.getByRole('button', { name: 'Compartir', exact: true })).toBeDisabled();

    await page.goto('/app/es/admin/auth/sign-in');

    await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', { error: new TypeError('SYNTHETIC_GPC') })));

    await expect(page.getByRole('button', { name: 'Reporte de error disponible' })).toBeVisible();

    expect(outbound).toEqual([]);
  });
}
