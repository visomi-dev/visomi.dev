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

for (const { url, privacyPath, width, height, theme, title, reject, position, inset, outsideOpacity } of [
  {
    url: '/',
    privacyPath: '/privacy/',
    width: 1440,
    height: 900,
    theme: 'light',
    title: 'Privacy settings',
    reject: 'No thanks',
    position: 'fixed',
    inset: true,
    outsideOpacity: '0',
  },
  {
    url: '/es/',
    privacyPath: '/es/privacy/',
    width: 375,
    height: 844,
    theme: 'dark',
    title: 'Configuración de privacidad',
    reject: 'No compartir',
    position: 'static',
    inset: false,
    outsideOpacity: '1',
  },
  {
    url: '/',
    privacyPath: '/privacy/',
    width: 1440,
    height: 620,
    theme: 'dark',
    title: 'Privacy settings',
    reject: 'No thanks',
    position: 'static',
    inset: false,
    outsideOpacity: '1',
  },
] as const) {
  test(`the consent notice leaves the portfolio hero in place at ${width}×${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });

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

    await expect(notice).toHaveCSS('position', position);

    const card = await notice.boundingBox();
    const firstTop = await headingTop();

    expect(card?.width).toBeLessThanOrEqual(320);
    expect(card?.y).toBeGreaterThan(firstTop);
    const atDesktopInset = [card!.x, height - card!.y - card!.height].every((inset) => Math.abs(inset - 16) < 1);

    expect(atDesktopInset).toBe(inset);

    await notice.scrollIntoViewIfNeeded();

    await page.screenshot({ path: info.outputPath(`consent-${theme}-${width}-${height}.png`), animations: 'disabled' });

    await page.keyboard.press('Tab');

    await expect(notice).toHaveCSS('opacity', outsideOpacity);

    const choice = notice.getByRole('button', { name: reject, exact: true });

    await choice.focus();

    await expect(notice).toHaveCSS('opacity', '1');

    await notice.getByRole('link').focus();

    await page.keyboard.press('Tab');

    const privacy = page.locator(`footer a[href="${privacyPath}"]`);

    await expect(privacy).toBeFocused();

    await choice.focus();

    await page.keyboard.press('Enter');

    await page.reload();

    await expect(notice).toBeHidden();

    const secondTop = await headingTop();

    expect(secondTop).toBeCloseTo(firstTop, 0);
    const audit = await new AxeBuilder({ page }).analyze();

    expect(audit.violations).toEqual([]);

    await privacy.click();

    await expect(page).toHaveURL(privacyPath);
  });
}
