import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [375, 1440]) {
    for (const locale of ['en', 'es']) {
      for (const pageName of ['', 'journey/', 'projects/', 'resume/', 'contact/']) {
        const path = `${locale === 'es' ? '/es' : ''}/${pageName}`;

        test(`accessibility ${theme} ${width} ${path}`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });

          await page.addInitScript((value) => localStorage.setItem('theme', value), theme);

          await page.goto(path);

          await page.evaluate(() => document.fonts.ready);

          const result = await new AxeBuilder({ page }).analyze();

          expect(result.violations).toEqual([]);
        });
      }
    }
  }
}
