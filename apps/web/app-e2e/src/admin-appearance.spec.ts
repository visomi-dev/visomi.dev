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

  await expect(control).toHaveAttribute('aria-pressed', String(dark));
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
    const current = page.locator('[data-language-switcher][aria-current=page]');

    await expect(current).toHaveAttribute('href', `/app/${locale}/admin/auth/sign-in`);

    await expect(current).toHaveText(locale === 'en' ? 'English' : 'Español');

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
    const scroll = shell.locator('[data-slot="page-scroll"]');
    const content = shell.locator('[data-slot="page-content"]');
    const header = shell.locator('header[app-topbar]');
    const theme = page.getByRole('button', { name: locale === 'es' ? 'Tema oscuro' : 'Dark theme' });

    await expect(scroll).toBeVisible();

    await expect(header).toBeVisible();

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

    await page.setViewportSize({ width: 1680, height: 620 });

    const collapse = page.getByRole('button', {
      name: locale === 'es' ? 'Contraer menú lateral' : 'Collapse sidebar',
    });
    const expanded = await scroll.boundingBox();

    await collapse.press('Enter');

    const expand = page.getByRole('button', { name: locale === 'es' ? 'Expandir menú lateral' : 'Expand sidebar' });

    await expect(expand).toBeFocused();

    await expect(expand).toHaveAttribute('aria-expanded', 'false');

    await expect
      .poll(async () => {
        const bounds = await scroll.boundingBox();

        return bounds?.x;
      })
      .toBeLessThan(expanded!.x - 100);

    await expect
      .poll(async () => {
        const bounds = await scroll.boundingBox();

        return bounds!.x + bounds!.width;
      })
      .toBe(1680);

    await expect
      .poll(async () => {
        const bounds = await content.boundingBox();

        return bounds?.width;
      })
      .toBeLessThan(1500);

    const headerBounds = await header.boundingBox();

    await scroll.evaluate((element) => (element.scrollTop = element.scrollHeight));

    await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await expect
      .poll(async () => {
        const bounds = await header.boundingBox();

        return bounds?.y;
      })
      .toBe(headerBounds!.y);

    const skip = page.getByRole('link', { name: locale === 'es' ? 'Saltar al contenido' : 'Skip to content' });

    await skip.press('Enter');

    await expect(scroll).toBeFocused();

    await page.screenshot({ path: info.outputPath(`shell-${locale}-desktop-compact.png`), animations: 'disabled' });

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

    await menu.press('Enter');

    await expect(dialog).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });

    await expect(dialog).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });

    await expect(menu).toBeVisible();

    await expect(dialog).toBeHidden();
  });
}
