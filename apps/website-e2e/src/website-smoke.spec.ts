import { expect, test } from '@playwright/test';

const locales = [
  {
    code: 'en',
    routes: ['/', '/journey/', '/projects/', '/resume/', '/contact/'],
  },
  {
    code: 'es',
    routes: ['/es/', '/es/journey/', '/es/projects/', '/es/resume/', '/es/contact/'],
  },
] as const;

test.describe('website smoke', () => {
  for (const locale of locales) {
    test.describe(locale.code, () => {
      for (const route of locale.routes) {
        test(route, async ({ page }) => {
          const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

          expect(response?.ok()).toBeTruthy();
          await expect(page.locator('main')).toBeVisible();
          await expect(page.locator('h1').first()).toBeVisible();
        });
      }
    });
  }
});
