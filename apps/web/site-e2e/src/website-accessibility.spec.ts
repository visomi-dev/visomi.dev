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

for (const { url, width, theme, title, reject } of [
  { url: '/', width: 1440, theme: 'light', title: 'Privacy settings', reject: 'Do not accept' },
  { url: '/es/', width: 375, theme: 'dark', title: 'Configuración de privacidad', reject: 'No aceptar' },
] as const) {
  test(`the consent notice leaves the portfolio hero in place at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });

    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });

    await page.goto(url);

    const notice = page.getByRole('region', { name: title });
    const heading = page.getByRole('heading', { level: 1 });
    const headingTop = () =>
      heading.evaluate(async (element) => {
        await document.fonts.ready;

        return element.getBoundingClientRect().top + window.scrollY;
      });

    await expect(notice).toBeVisible();

    const card = await notice.boundingBox();
    const firstTop = await headingTop();

    expect(card?.width).toBeLessThan(width);
    expect(card?.width).toBeLessThanOrEqual(384);
    expect(card?.y).toBeGreaterThan(firstTop);

    await notice.scrollIntoViewIfNeeded();

    await page.screenshot({ path: info.outputPath(`consent-${theme}-${width}.png`), animations: 'disabled' });

    const choice = notice.getByRole('button', { name: reject, exact: true });

    await choice.focus();

    await page.keyboard.press('Enter');

    await page.reload();

    await expect(notice).toBeHidden();

    const secondTop = await headingTop();

    expect(secondTop).toBeCloseTo(firstTop, 0);
    const audit = await new AxeBuilder({ page }).analyze();

    expect(audit.violations).toEqual([]);
  });
}
