import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/journey/',
  '/projects/',
  '/resume/',
  '/contact/',
  '/es/',
  '/es/journey/',
  '/es/projects/',
  '/es/resume/',
  '/es/contact/',
] as const;

test.describe('gateway public screens', () => {
  for (const route of routes) {
    test(`${route} renders through the monolith gateway`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      expect(response?.ok()).toBe(true);
      await expect(page.locator('main, section').first()).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
      await page.screenshot({
        path: `artifacts/apps/web/site-e2e/gateway${route.replaceAll('/', '-') || 'root'}.png`,
        fullPage: true,
      });
    });
  }
});
