import { expect, test } from '@playwright/test';

test.describe('monolith gateway', () => {
  test('exposes the runtime health endpoint', async ({ request }) => {
    const response = await request.get('/healthz');

    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  test('mounts the API under /api', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  test('serves Angular under /app', async ({ page }) => {
    const response = await page.goto('/app/');

    expect(response?.ok()).toBe(true);
    await expect(page.locator('app-root')).toBeVisible();
  });
});
