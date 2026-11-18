import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
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

    const toggle = page.getByRole('button', {
      name: locale === 'es' ? 'Mostrar u ocultar contraseña' : 'Show or hide password',
    });
    const password = page.getByLabel(locale === 'es' ? 'Contraseña' : 'Password', { exact: true });

    await toggle.click();

    await expect(password).toHaveAttribute('type', 'text');

    await toggle.click();

    await expect(password).toHaveAttribute('type', 'password');

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);

      for (const dark of [false, true]) {
        await setDarkTheme(theme, dark);

        await expect(theme).toHaveAttribute('aria-pressed', String(dark));

        await expect(page.locator('app-root')).not.toHaveAttribute('data-theme-transition', '');

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

for (const locale of ['en', 'es'] as const) {
  test(`${locale} uses the reference shell and a keyboard-accessible mobile menu`, async ({
    page,
    baseURL,
    browserName,
  }, info) => {
    const file = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`, 'session.json');
    const data = await readFile(file, 'utf8');
    const { cookies } = JSON.parse(data) as { cookies: Record<string, string> };

    await page.context().addCookies([
      {
        name: '__Host-visomi.sid',
        value: encodeURIComponent(cookies[`metricsOwner-${browserName}`]),
        url: baseURL!,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      },
    ]);

    await page.goto(`/app/${locale}/admin/metrics`);

    const shell = page.locator('app-shell');
    const theme = page.getByRole('button', { name: locale === 'es' ? 'Tema oscuro' : 'Dark theme' });

    await expect(shell.locator('[data-slot="page-scroll"]')).toBeVisible();

    await expect(shell.locator('header[app-topbar]')).toBeVisible();

    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });

      for (const dark of [false, true]) {
        await setDarkTheme(theme, dark);

        await expect(page.locator('app-root')).not.toHaveAttribute('data-theme-transition', '');

        const audit = await new AxeBuilder({ page }).analyze();

        expect(audit.violations).toEqual([]);

        await page.screenshot({
          path: info.outputPath(`shell-${locale}-${width}-${dark ? 'dark' : 'light'}.png`),
          animations: 'disabled',
        });
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });

    const menu = page.getByRole('button', { name: locale === 'es' ? 'Menú' : 'Menu', exact: true });

    await menu.focus();

    await menu.press('Enter');

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByRole('button', { name: locale === 'es' ? 'Cerrar navegación' : 'Close navigation' }),
    ).toBeFocused();

    await page.screenshot({ path: info.outputPath(`menu-${locale}-mobile-dark.png`), animations: 'disabled' });

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();

    await expect(menu).toBeFocused();
  });
}
