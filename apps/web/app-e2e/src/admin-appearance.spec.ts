import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

async function setDarkTheme(control: Locator, dark: boolean) {
  const pressed = await control.getAttribute('aria-pressed');

  if (pressed !== String(dark)) {
    await control.click();
  }
}

for (const locale of ['en', 'es'] as const) {
  test(`${locale} sign-in preserves the stack card, theme controls and accessible mobile layout`, async ({
    page,
  }, info) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(error.name));

    await page.goto(`/app/${locale}/admin/auth/sign-in`);

    const theme = page.getByRole('button', { name: locale === 'es' ? 'Tema oscuro' : 'Dark theme' });

    await expect(theme).toBeVisible();

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);

      for (const dark of [false, true]) {
        await setDarkTheme(theme, dark);

        await expect(theme).toHaveAttribute('aria-pressed', String(dark));

        const accessibility = await new AxeBuilder({ page }).analyze();

        expect(accessibility.violations).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

        expect(overflow).toBe(false);

        await page.evaluate(() => document.fonts.ready);

        await page.screenshot({
          path: info.outputPath(`sign-in-${locale}-${viewport.width}-${dark ? 'dark' : 'light'}.png`),
          animations: 'disabled',
        });
      }
    }
    expect(errors).toEqual([]);
    const other = page.getByRole('link', { name: locale === 'en' ? 'Español' : 'English', exact: true });

    await other.click();

    await expect(page).toHaveURL(
      locale === 'en' ? /\/app\/es\/admin\/auth\/sign-in$/ : /\/app\/en\/admin\/auth\/sign-in$/,
    );
  });
}
