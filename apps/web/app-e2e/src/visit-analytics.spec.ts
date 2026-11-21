import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { workspaceRoot } from '@nx/devkit';
import { expect, test, type Page } from '@playwright/test';

test('the owner can compare public page views without collecting URLs or exposing the report', async ({
  page,
  baseURL,
  browserName,
}, info) => {
  const anonymous = await page.request.get('/api/private/visits?period=7');

  expect(anonymous.status()).toBe(401);
  const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);
  const raw = await readFile(resolve(directory, 'session.json'), 'utf8');
  const { cookies } = JSON.parse(raw) as { cookies: Record<string, string> };
  const cookie = (role: string) => ({
    name: '__Host-visomi.sid',
    value: encodeURIComponent(cookies[`${role}-${browserName}`]),
    url: baseURL!,
    httpOnly: true,
    secure: true,
    sameSite: 'Strict' as const,
  });

  await page.context().addCookies([cookie('other')]);

  const denied = await page.request.get('/api/private/visits?period=7');

  expect(denied.status()).toBe(403);
  expect(denied.headers()['cache-control']).toContain('no-store');

  await page.context().addCookies([cookie('metricsOwner')]);

  const localMetrics = await page.request.get('/api/private/metrics');

  expect(localMetrics.status()).toBe(200);
  expect(localMetrics.headers()['cache-control']).toContain('no-store');

  const localMetricsBody = await localMetrics.json();

  expect(localMetricsBody).toMatchObject({
    enabled: true,
    scope: 'web-gateway',
    traceExportEnabled: false,
    metrics: { requests: expect.any(Number) },
  });

  const received: unknown[] = [];

  page.on('response', (response) => {
    if (response.url().endsWith('/telemetry/visits') && response.status() === 204) {
      received.push(response.request().postDataJSON());
    }
  });

  await page.goto('/privacy/');

  await page.getByRole('button', { name: 'Share', exact: true }).click();

  await expect(page.getByRole('status')).toHaveText('Automatic sharing is on.');

  await page.goto('/?private=synthetic-visit-query#synthetic-section');

  await expect.poll(() => received).toEqual([{ page: 'home', locale: 'en' }]);

  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
  });

  await page.getByRole('link', { name: '// JOURNEY', exact: true }).first().click();

  await expect
    .poll(() => received)
    .toEqual([
      { page: 'home', locale: 'en' },
      { page: 'journey', locale: 'en' },
    ]);

  const response = await page.goto('/app/es/admin/visits');

  expect(response?.status()).toBe(200);
  expect(response?.headers()['cache-control']).toContain('no-store');

  await expect(page.getByRole('heading', { name: 'Analítica de visitas' })).toBeVisible();

  await expect(page.getByText('journey · en')).toBeVisible();

  await expect(page.locator('[data-visit-current]')).toHaveText(/[1-9]/);

  const privateSnapshot = await page.request.get('/api/private/visits?period=7');
  const data = await privateSnapshot.text();

  expect(privateSnapshot.headers()['cache-control']).toContain('no-store');
  expect(data).not.toMatch(/synthetic-visit-query|synthetic-section|https?:|example.test/);

  await page.getByRole('link', { name: '30 días' }).click();

  await expect(page).toHaveURL(/\?period=30$/);

  await expect(page.getByRole('link', { name: '30 días' })).toHaveAttribute('aria-current', 'page');

  await page.setViewportSize({ width: 390, height: 844 });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  expect(overflow).toBe(false);
  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);

  await page.screenshot({ path: info.outputPath('visits-es-mobile.png'), animations: 'disabled' });
});

function telemetryRequests(tab: Page): string[] {
  const requests: string[] = [];

  tab.on('request', (entry) => {
    const { pathname } = new URL(entry.url());

    if (pathname.startsWith('/telemetry/')) {
      requests.push(pathname);
    }
  });

  return requests;
}

function raiseError(tab: Page, kind: 'RangeError' | 'ReferenceError' | 'SyntaxError' | 'TypeError'): Promise<boolean> {
  return tab.evaluate((name) => window.dispatchEvent(new ErrorEvent('error', { error: new window[name]() })), kind);
}

for (const [source, index, thanks] of [
  ['Astro', 0, 'Gracias'],
  ['Angular', 1, 'Thanks for sharing.'],
] as const) {
  test(`${source} shares a revocable origin decision between already-open Astro and owner admin tabs`, async ({
    page,
    context,
    baseURL,
    browserName,
  }, info) => {
    const fixture = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`, 'session.json');
    const fixtureContent = await readFile(fixture, 'utf8');
    const { cookies } = JSON.parse(fixtureContent) as { cookies: Record<string, string> };

    await context.addCookies([
      {
        name: '__Host-visomi.sid',
        value: encodeURIComponent(cookies[`metricsOwner-${browserName}`]),
        url: baseURL!,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      },
    ]);

    const admin = await context.newPage();
    const siteRequests = telemetryRequests(page);
    const adminRequests = telemetryRequests(admin);
    const siteNotice = page.getByRole('region', { name: 'Configuración de privacidad' });
    const adminNotice = admin.getByRole('region', { name: 'Privacy settings' });
    const siteShare = siteNotice.getByRole('button', { name: 'Compartir', exact: true });
    const siteReject = siteNotice.getByRole('button', { name: 'No compartir', exact: true });
    const adminShare = adminNotice.getByRole('button', { name: 'Share', exact: true });

    const expectNoAutomaticErrors = async (kind: 'RangeError' | 'ReferenceError' | 'SyntaxError') => {
      const before = [siteRequests.length, adminRequests.length];

      await Promise.all([raiseError(page, kind), raiseError(admin, kind)]);

      const openers = [
        page.getByRole('button', { name: 'Reporte de error disponible' }),
        admin.getByRole('button', { name: 'Error report available' }),
      ];

      for (const [index, tab] of [page, admin].entries()) {
        await openers[index].click();

        const dialog = tab.getByRole('dialog');

        await expect(dialog.getByText(kind, { exact: true })).toBeVisible();

        await tab.keyboard.press('Escape');

        await expect(dialog).toBeHidden();
      }

      expect([siteRequests.slice(before[0]), adminRequests.slice(before[1])]).toEqual([[], []]);
    };

    await page.setViewportSize({ width: 390, height: 844 });

    const settings = await context.newPage();
    const setting = settings.getByRole('region', { name: 'Privacy settings' });

    await settings.goto('/privacy/');

    await Promise.all([page.goto('/es/'), admin.goto('/app/en/admin/metrics')]);

    await expect(admin.getByRole('heading', { name: 'Technical metrics' })).toBeVisible();

    await expect(admin.getByText('Private trace export is off.')).toBeVisible();

    await expect(adminShare).toBeVisible();

    await expect(siteShare).toBeVisible();

    const acceptStyle = await siteShare.getAttribute('class');

    await expect(siteReject).toHaveAttribute('class', acceptStyle!);

    await expect(siteNotice.getByRole('link', { name: 'Cómo usamos estos datos' })).toHaveAttribute(
      'href',
      '/es/privacy/',
    );

    await expect(adminNotice.getByRole('link', { name: 'How we use this data' })).toHaveAttribute('href', '/privacy/');

    expect([siteRequests, adminRequests]).toEqual([[], []]);

    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await siteNotice.scrollIntoViewIfNeeded();

    await page.screenshot({ path: info.outputPath('portfolio-consent-es-mobile.png'), animations: 'disabled' });

    await siteReject.focus();

    await page.keyboard.press('Enter');

    await expect(siteNotice.getByRole('status')).toHaveText('El envío automático está desactivado.');

    await expect(adminNotice.getByRole('status')).toHaveText('Automatic sharing is off.');

    await expect(setting.getByRole('status')).toHaveText('Automatic sharing is off.');

    await expectNoAutomaticErrors('RangeError');

    expect([siteRequests, adminRequests]).toEqual([[], []]);

    const surfaces = [page, admin];
    const grantTab = surfaces[index];
    const grantButton = [siteShare, adminShare][index];
    const confirmation = grantTab.locator('[data-consent-confirmation]');
    const otherConfirmation = surfaces[1 - index].locator('[data-consent-confirmation]');

    await grantTab.clock.install();

    await grantButton.click();

    await expect(confirmation).toBeVisible();

    await expect(grantTab.locator('[data-consent-announcement]')).toHaveText(thanks);

    await expect(otherConfirmation).toBeHidden();

    await expect(siteNotice).toBeHidden();

    await expect(adminNotice).toBeHidden();

    await expect(setting.getByRole('status')).toHaveText('Automatic sharing is on.');

    expect([siteRequests, adminRequests]).toEqual([[], []]);

    await confirmation.scrollIntoViewIfNeeded();

    await grantTab.screenshot({
      path: info.outputPath(`consent-confirmation-${source.toLowerCase()}.png`),
      animations: 'disabled',
    });

    const nextPage = await context.newPage();
    const observedVisit = nextPage.waitForResponse((response) => response.url().endsWith('/telemetry/visits'));

    await nextPage.goto('/journey/?synthetic=visit#private');

    const visit = await observedVisit;

    expect(visit.status()).toBe(204);
    expect(visit.request().postDataJSON()).toEqual({ page: 'journey', locale: 'en' });

    const headers = await visit.request().allHeaders();

    expect(headers['origin']).toBe(new URL(baseURL!).origin);
    expect(headers['cookie']).toBeUndefined();
    expect(headers['referer']).toBeUndefined();
    const denied = await nextPage.request.post('/telemetry/visits', {
      headers: { origin: 'https://wrong.example.test' },
      data: { page: 'journey', locale: 'en' },
    });

    expect(denied.status()).toBe(403);

    await nextPage.getByRole('link', { name: 'Privacy', exact: true }).click();

    await expect(nextPage).toHaveURL(/\/privacy\/$/);

    await expect(nextPage.getByRole('region', { name: 'Privacy settings' }).getByRole('status')).toHaveText(
      'Automatic sharing is on.',
    );

    for (const [tab, application] of [
      [page, 'web-site'],
      [admin, 'web-app'],
    ] as const) {
      const observedError = tab.waitForResponse((response) => response.url().endsWith('/telemetry/errors'));

      await raiseError(tab, 'TypeError');

      const report = await observedError;

      expect(report.status()).toBe(202);
      expect(report.request().postDataJSON()).toMatchObject({ application, kind: 'TypeError' });
    }

    await grantTab.clock.runFor(10_000);

    await expect(confirmation).toBeHidden();

    await expect(setting.getByRole('status')).toHaveText('Automatic sharing is on.');

    await setting.getByRole('button', { name: 'No thanks', exact: true }).click();

    await expect(setting.getByRole('status')).toHaveText('Automatic sharing is off.');

    await expect(confirmation).toBeHidden();

    await expect(grantTab.locator('[data-consent-announcement]')).toBeEmpty();

    await expectNoAutomaticErrors('ReferenceError');

    const beforeNavigation = siteRequests.length;

    await page.goto('/projects/');

    await expect(page.getByRole('link', { name: 'Privacy', exact: true })).toBeVisible();

    expect(siteRequests).toHaveLength(beforeNavigation);
  });
}
