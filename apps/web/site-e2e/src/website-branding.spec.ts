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

        await page.evaluate(() => {
          // Software WebGL rendering on hosted CI competes with screenshot/navigation work.
          // Pause only the procedural background; the existing WebGL suite tests its real lifecycle.
          document.getElementById('dark-bg')?.classList.add('hidden');
          document.dispatchEvent(new Event('visibilitychange'));
        });

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

          await expect(loader.getByRole('status')).toHaveText(status);

          const bar = loader.locator('.navigation-progress');

          await expect(bar).toBeVisible();

          await expect(loader).toHaveCSS('pointer-events', 'none');

          await expect(loader).toHaveCSS('height', '2px');

          await expect(loader.locator('svg')).toHaveCount(0);

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
  const animation = reducedMotion === 'reduce' ? 'none' : 'navigation-progress-slide';

  test(`navigation bar respects ${reducedMotion} motion preference`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });

    await page.goto('/');

    await expect(page.locator('.navigation-progress')).toHaveCSS('animation-name', animation);
  });
}
