import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';

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

  const received: unknown[] = [];

  page.on('response', (response) => {
    if (response.url().endsWith('/telemetry/visits') && response.status() === 204) {
      received.push(response.request().postDataJSON());
    }
  });

  await page.goto('/privacy/');

  await page.getByRole('button', { name: 'Accept', exact: true }).click();

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

test('shares a revocable origin decision between Astro and the owner admin', async ({
  page,
  baseURL,
  browserName,
}, info) => {
  const telemetry: string[] = [];

  page.on('request', (entry) => {
    const { pathname } = new URL(entry.url());

    if (pathname.startsWith('/telemetry/')) {
      telemetry.push(pathname);
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/es/');

  const notice = page.getByRole('region', { name: 'Configuración de privacidad' });
  const accept = notice.getByRole('button', { name: 'Aceptar', exact: true });
  const reject = notice.getByRole('button', { name: 'No aceptar', exact: true });

  await expect(accept).toBeVisible();

  const acceptStyle = await accept.getAttribute('class');

  await expect(reject).toHaveAttribute('class', acceptStyle!);

  expect(telemetry).toEqual([]);

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await notice.scrollIntoViewIfNeeded();

  await page.screenshot({ path: info.outputPath('portfolio-consent-es-mobile.png'), animations: 'disabled' });

  await accept.focus();

  await page.keyboard.press('Enter');

  await expect(notice.getByRole('status')).toHaveText('El envío automático está activado.');

  expect(telemetry).toEqual([]);

  const accepted = page.waitForResponse((response) => response.url().endsWith('/telemetry/visits'));

  await page.goto('/journey/?synthetic=visit#private');

  const visit = await accepted;

  expect(visit.status()).toBe(204);
  expect(visit.request().postDataJSON()).toEqual({ page: 'journey', locale: 'en' });
  const headers = await visit.request().allHeaders();

  expect(headers['origin']).toBe(new URL(baseURL!).origin);
  expect(headers['cookie']).toBeUndefined();
  expect(headers['referer']).toBeUndefined();
  const denied = await page.request.post('/telemetry/visits', {
    headers: { origin: 'https://wrong.example.test' },
    data: { page: 'journey', locale: 'en' },
  });

  expect(denied.status()).toBe(403);
  const fixture = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`, 'session.json');
  const fixtureContent = await readFile(fixture, 'utf8');
  const { cookies } = JSON.parse(fixtureContent) as { cookies: Record<string, string> };

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

  const admin = await page.context().newPage();

  await admin.goto('/app/en/admin/metrics');

  await expect(admin.getByRole('heading', { name: 'Technical metrics' })).toBeVisible();

  await expect(admin.getByRole('region', { name: 'Privacy settings' })).toBeHidden();

  await expect(admin.getByText('Private trace export is off.')).toBeVisible();

  await admin.getByRole('link', { name: 'Privacy', exact: true }).click();

  await expect(admin).toHaveURL(/\/privacy\/$/);

  await expect(admin.getByRole('status')).toHaveText('Automatic sharing is on.');

  await admin.getByRole('button', { name: 'Do not accept', exact: true }).click();

  await expect(admin.getByRole('status')).toHaveText('Automatic sharing is off.');

  const before = telemetry.length;

  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new ErrorEvent('error', { error: new SyntaxError('SYNTHETIC_REVOKE') }));
  });

  await expect(page.getByRole('button', { name: 'Error report available' })).toBeVisible();

  await page.goto('/projects/');

  await expect(page.getByRole('link', { name: 'Privacy', exact: true })).toBeVisible();

  expect(telemetry).toHaveLength(before);

  await admin.close();
});
