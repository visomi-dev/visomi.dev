import { expect, test } from '@playwright/test';

const routes = ['/app/'] as const;

test.describe('gateway application screens', () => {
  for (const route of routes) {
    test(`${route} renders through the monolith gateway`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      expect(response?.ok()).toBe(true);
      await expect(page.locator('app-root, main').first()).toBeVisible();
      await page.screenshot({
        path: `artifacts/apps/web/app-e2e/gateway${route.replaceAll('/', '-') || 'root'}.png`,
        fullPage: true,
      });
    });
  }
});
