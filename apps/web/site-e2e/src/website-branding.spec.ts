import { expect, test, type Page } from '@playwright/test';

async function openMobileMenu(page: Page, width: number) {
  if (width < 768) {
    await page.locator('#mobile-menu-btn').click();
  }
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [375, 1440]) {
    for (const locale of ['en', 'es']) {
      const home = locale === 'es' ? '/es/' : '/';
      const path = locale === 'es' ? '/es/contact/' : '/contact/';
      const logoSelector = width < 768 ? 'img[src*="isotype."]' : 'img[src*="logotype."]';
      const filter = theme === 'dark' ? 'invert(1)' : 'none';
      const status = locale === 'es' ? 'Cargando página' : 'Loading page';

      test(`approved branding ${theme} ${width} ${locale}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });

        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });

        await page.addInitScript((value) => localStorage.setItem('theme', value), theme);

        await page.goto(home);

        const brand = page.locator('[data-brand-home]');
        const logo = brand.locator(logoSelector);

        await expect(brand).toHaveAttribute('href', home);

        await expect(brand).toHaveAccessibleName(/Visomi/);

        await expect(logo).toBeVisible();

        await expect(logo).toHaveCSS('filter', filter);

        await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

        const iconUrl = await page.locator('link[rel="icon"]').getAttribute('href');
        const icon = await page.request.get(iconUrl!);
        const iconBody = await icon.text();

        expect(icon.ok()).toBe(true);
        expect(icon.headers()['content-type']).toContain('image/svg+xml');
        expect(iconBody).toContain('upper-ribbon');
        expect(iconBody).toContain('prefers-color-scheme: dark');

        const legacyIcon = await page.request.get('/favicon.svg');
        const legacyIconBody = await legacyIcon.text();

        expect(legacyIcon.ok()).toBe(true);
        expect(legacyIconBody).toBe(iconBody);

        await page.locator('nav').screenshot({ path: testInfo.outputPath('navigation.png'), animations: 'disabled' });

        let release: () => void = () => undefined;
        const pending = new Promise<void>((resolve) => {
          release = resolve;
        });

        await page.route(`**${path}`, async (route) => {
          await pending;

          await route.continue();
        });

        await openMobileMenu(page, width);

        const navigation = page.locator(`nav a[href="${path}"]:visible`).first().click();
        const loader = page.locator('#page-navigation-loader');

        try {
          await expect(loader).toBeVisible();

          await expect(loader.locator('.sr-only')).toHaveText(status);

          const artwork = loader.locator('.brand-loader');

          await expect(artwork.locator('svg')).toBeVisible();

          await expect(artwork.locator('svg')).toHaveAttribute('viewBox', '0 0 545 547');

          await expect(artwork.locator('mask')).toHaveCount(3);

          await expect(artwork).toHaveCSS('filter', filter);

          await loader.screenshot({ path: testInfo.outputPath('loader.png'), animations: 'disabled' });
        } finally {
          release();
        }

        await navigation;

        await expect(page).toHaveURL(new RegExp(`${path}$`));

        await expect(loader).toBeHidden();

        await expect(page.locator('[data-brand-home]')).toBeVisible();
      });
    }
  }
}

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  const duration = reducedMotion === 'reduce' ? '1e-06s' : '1.6s';
  const animation = reducedMotion === 'reduce' ? 'none' : 'visomi-loader-draw-0';

  test(`loader respects ${reducedMotion} motion preference`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });

    await page.goto('/');

    await expect(page.locator('.visomi-loader-draw').first()).toHaveCSS('animation-duration', duration);

    await expect(page.locator('.visomi-loader-draw').first()).toHaveCSS('animation-name', animation);

    await expect(page.locator('.visomi-loader-ink')).toHaveCSS('animation-duration', duration);
  });
}
