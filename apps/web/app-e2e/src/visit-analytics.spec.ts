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

  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);

  await page.screenshot({ path: info.outputPath('visits-es-mobile.png'), animations: 'disabled' });
});
