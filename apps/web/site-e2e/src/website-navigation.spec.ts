import { expect, test, type Page } from '@playwright/test';

async function follow(page: Page, path: string, width: number) {
  if (width < 768) {
    await page.locator('#mobile-menu-btn').click();
  }

  await page.locator(`nav a[href="${path}"]:visible`).first().click();
}

async function pauseBackground(page: Page) {
  await page.evaluate(() => {
    document.getElementById('dark-bg')?.classList.add('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

for (const width of [375, 1440]) {
  for (const locale of ['en', 'es']) {
    const prefix = locale === 'es' ? '/es' : '';
    const home = `${prefix}/`;
    const projects = `${prefix}/projects/`;
    const journey = `${prefix}/journey/`;
    const contact = `${prefix}/contact/`;
    const otherLocale = locale === 'en' ? 'es' : 'en';
    const otherPrefix = otherLocale === 'es' ? '/es' : '';

    test.describe(`navigation ${width} ${locale}`, () => {
      test.use({ viewport: { width, height: 900 } });

      test('direct load, internal routes and history retain ClientRouter transitions and focus', async ({ page }) => {
        await page.goto(home);

        await pauseBackground(page);

        await expect(page.locator('#page-navigation-loader')).toBeHidden();

        await page.evaluate(() => {
          // The window survives a swap; attributes on <html> are replaced by Astro.
          const state = { calls: 0, oldAnimation: '' };
          const browser = window as typeof window & { navigationEvidence: typeof state };
          const start = document.startViewTransition.bind(document);

          browser.navigationEvidence = state;
          document.startViewTransition = (...args) => {
            state.calls++;

            const transition = start(...args);

            void transition.ready.then(() => {
              state.oldAnimation = getComputedStyle(
                document.documentElement,
                '::view-transition-old(root)',
              ).animationName;
            });

            return transition;
          };
        });

        await follow(page, journey, width);

        await expect(page).toHaveURL(journey);

        await expect
          .poll(() =>
            page.evaluate(() => {
              const browser = window as typeof window & { navigationEvidence: { calls: number; oldAnimation: string } };

              return browser.navigationEvidence;
            }),
          )
          .toMatchObject({ calls: 1, oldAnimation: expect.stringMatching(/fade/i) });

        await expect(page.locator('#page-navigation-loader')).toBeHidden();

        await expect(page.locator('h1')).toBeVisible();

        await page.goBack();

        await expect(page).toHaveURL(home);

        await page.goForward();

        await expect(page).toHaveURL(journey);

        await expect(page.locator('#page-navigation-loader')).toBeHidden();

        const title = await page.title();

        await expect(page.locator('.astro-route-announcer')).toHaveText(title);

        await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);
      });

      test('history restores scroll and locale changes keep the theme and translated bar', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('theme', 'dark'));

        await page.goto(projects);

        await page.evaluate(() => window.scrollTo(0, 700));

        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

        await follow(page, journey, width);

        await expect(page).toHaveURL(journey);

        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

        await page.goBack();

        await expect(page).toHaveURL(projects);

        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

        const otherJourney = `${otherPrefix}/journey/`;

        await page.locator(`nav a[hreflang="${otherLocale}"]`).click();

        await expect(page).toHaveURL(`${otherPrefix}/projects/`);

        await expect(page.locator('html')).toHaveAttribute('lang', otherLocale);

        await expect(page.locator('html')).toHaveClass(/dark/);

        let release: () => void = () => undefined;
        const pending = new Promise<void>((resolve) => {
          release = resolve;
        });

        await page.route(`**${otherJourney}`, async (route) => {
          await pending;

          await route.continue();
        });

        try {
          await follow(page, otherJourney, width);

          await expect(page.locator('#page-navigation-loader')).toBeVisible();

          await expect(page.getByRole('status')).toHaveText(otherLocale === 'es' ? 'Cargando página' : 'Loading page');
        } finally {
          release();
        }

        await expect(page).toHaveURL(otherJourney);

        await expect(page.locator('#page-navigation-loader')).toBeHidden();
      });

      test('a slow route shows a nonblocking thin bar and keeps it continuous when superseded', async ({
        page,
      }, info) => {
        await page.goto(home);

        await pauseBackground(page);

        let release: () => void = () => undefined;
        const pending = new Promise<void>((resolve) => {
          release = resolve;
        });

        await page.route(`**${projects}`, async (route) => {
          await pending;

          await route.continue();
        });

        try {
          await follow(page, projects, width);

          const loader = page.locator('#page-navigation-loader');

          await expect(loader).toBeVisible();

          await expect(loader).toHaveCSS('height', '2px');

          await expect(loader).toHaveCSS('pointer-events', 'none');

          await page.screenshot({ path: info.outputPath('slow-navigation.png'), animations: 'disabled' });

          // The old document remains interactive while preparation is pending.
          await page.locator(`nav a[href="${journey}"]:visible`).first().click();

          await expect(page).toHaveURL(journey);

          await expect(loader).toBeHidden();
        } finally {
          release();
        }

        await expect(page).toHaveURL(journey);

        await follow(page, contact, width);

        await expect(page).toHaveURL(contact);

        await expect(page.locator('#page-navigation-loader')).toBeHidden();
      });

      test('a network failure uses Astro fallback and permits subsequent navigation', async ({ page }) => {
        await page.goto(home);

        await pauseBackground(page);

        let release: () => void = () => undefined;
        const pending = new Promise<void>((resolve) => {
          release = resolve;
        });

        await page.route(`**${projects}`, async (route) => {
          if (route.request().isNavigationRequest()) {
            await route.fulfill({
              status: 503,
              contentType: 'text/html',
              body: `<!doctype html><html lang="${locale}"><head><title>Unavailable</title></head><body><h1>Synthetic destination unavailable</h1><a href="${home}">Home</a></body></html>`,
            });

            return;
          }

          await pending;

          await route.abort('failed');
        });

        try {
          await follow(page, projects, width);

          await expect(page.locator('#page-navigation-loader')).toBeVisible();
        } finally {
          release();
        }

        // Astro deliberately falls back to a document navigation when fetch fails.
        await expect(page.getByRole('heading', { name: 'Synthetic destination unavailable' })).toBeVisible();

        await expect(page.locator('#page-navigation-loader')).toHaveCount(0);

        await page.getByRole('link', { name: 'Home', exact: true }).click();

        await expect(page).toHaveURL(home);

        await follow(page, journey, width);

        await expect(page).toHaveURL(journey);

        await expect(page.locator('#page-navigation-loader')).toBeHidden();
      });
    });
  }
}
