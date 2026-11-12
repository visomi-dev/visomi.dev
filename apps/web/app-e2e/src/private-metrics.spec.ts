import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { workspaceRoot } from '@nx/devkit';
import { expect, test, type Page } from '@playwright/test';

async function owner(page: Page, baseURL: string, role: 'owner' | 'other' = 'owner') {
  const file = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL).port}`, 'session.json');
  const content = await readFile(file, 'utf8');
  const data = JSON.parse(content) as { cookies: Record<'owner' | 'other', string> };

  await page.context().addCookies([
    {
      name: 'visomi.sid',
      value: encodeURIComponent(data.cookies[role]),
      url: baseURL,
      httpOnly: true,
      sameSite: 'Strict',
    },
  ]);
}

test('metrics reject anonymous users and authenticated non-owners on the server and in routing', async ({
  page,
  baseURL,
}) => {
  const denied = await page.request.get('/api/private/metrics');

  expect(denied.status()).toBe(401);

  await page.goto('/app/en/metrics');

  await expect(page).toHaveURL(/\/access$/);

  await owner(page, baseURL!, 'other');

  const forbidden = await page.request.get('/api/private/metrics');

  expect(forbidden.status()).toBe(403);
  expect(forbidden.headers()['cache-control']).toContain('no-store');

  await page.goto('/app/en/metrics');

  await expect(page).toHaveURL(/\/access$/);
});

test('the owner opens and refreshes real process metrics without exposing contact data', async ({
  page,
  baseURL,
}, info) => {
  await owner(page, baseURL!);

  await page.goto('/app/en/dashboard');

  await page.getByRole('link', { name: 'Technical metrics' }).click();

  await expect(page.getByRole('heading', { name: 'Technical metrics' })).toBeVisible();

  await expect(page.locator('dl dd')).toHaveCount(6);

  await expect(page.locator('[data-metric="requests"]')).toHaveText(/[1-9]/);

  const response = await page.request.get('/api/private/metrics');
  const snapshot = await response.text();

  expect(response.headers()['cache-control']).toContain('no-store');
  expect(response.headers()['vary']).toContain('Cookie');
  expect(JSON.parse(snapshot)).toMatchObject({ enabled: true, scope: 'web-gateway', traceExportEnabled: false });
  expect(snapshot).not.toMatch(/example.test|Synthetic browser|contactXss|password/);

  await page.getByRole('button', { name: 'Refresh metrics' }).click();

  await expect(page).toHaveURL(/metrics\?refresh=/);

  await expect(page.locator('dl dd')).toHaveCount(6);

  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);

  await page.screenshot({ path: info.outputPath('private-metrics.png'), animations: 'disabled' });
});

const zero = { requests: 0, clientErrors: 0, serverErrors: 0, aborted: 0, meanLatencyMs: 0, maxLatencyMs: 0 };
const states = [
  { name: 'disabled', status: 200, enabled: false, metrics: null, text: 'Local metrics collection is disabled.' },
  { name: 'empty', status: 200, enabled: true, metrics: zero, text: 'Waiting for HTTP measurements.' },
  {
    name: 'unavailable',
    status: 503,
    enabled: false,
    metrics: null,
    text: 'Metrics could not be loaded. Please try again.',
  },
];

for (const state of states) {
  test(`metrics show a clear ${state.name} state`, async ({ page, baseURL }) => {
    await owner(page, baseURL!);

    await page.route('**/api/private/metrics', (route) =>
      route.fulfill({
        status: state.status,
        contentType: 'application/json',
        body: JSON.stringify({
          enabled: state.enabled,
          scope: 'web-gateway',
          windowMinutes: 15,
          traceExportEnabled: false,
          metrics: state.metrics,
        }),
      }),
    );

    await page.goto('/app/en/metrics');

    await expect(page.getByText(state.text, { exact: false })).toBeVisible();
  });
}

test('Spanish metrics remain accessible at mobile widths', async ({ page, baseURL }, info) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await owner(page, baseURL!);

  const documentResponse = await page.goto('/app/es/metrics');

  expect(documentResponse!.headers()['cache-control']).toContain('no-store');

  await expect(page.getByRole('heading', { name: 'Métricas técnicas' })).toBeVisible();

  await expect(page.getByRole('link', { name: 'Solicitudes de contacto' })).toBeVisible();

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);

  await page.screenshot({ path: info.outputPath('private-metrics-es-mobile.png'), animations: 'disabled' });
});
