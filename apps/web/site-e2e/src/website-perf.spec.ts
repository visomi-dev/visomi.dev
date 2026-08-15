import { expect, test } from '@playwright/test';

const publicPaths = ['/', '/journey/', '/projects/', '/resume/', '/contact/'] as const;

const observeConsoleErrors = (page: import('@playwright/test').Page) => {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
};

test.describe('ClientRouter navigation', () => {
  for (const path of publicPaths) {
    test(`prefetch link is present for ${path}`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const prefetch = page.locator(`head link[rel="prefetch"][href="${path}"]`);

      await expect(prefetch).toHaveCount(1);
    });
  }

  test('internal navigation swaps without a full page reload', async ({ page }) => {
    const errors = observeConsoleErrors(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const navigationMarker = '__astro_spa_navigation__';

    await page.evaluate((marker) => {
      (window as unknown as Record<string, unknown>)[marker] = true;
    }, navigationMarker);

    await page.locator('nav a[href="/journey/"]').first().click();

    await expect(page).toHaveURL(/\/journey\/$/);

    const markerSurvived = await page.evaluate((marker) => {
      return Boolean((window as unknown as Record<string, unknown>)[marker]);
    }, navigationMarker);

    expect(markerSurvived).toBe(true);

    const filteredErrors = errors.filter((error) => !error.includes('Failed to load resource'));

    expect(filteredErrors).toEqual([]);
  });

  test('ClientRouter swaps preserve the page-navigation-loader behaviour', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loader = page.locator('#page-navigation-loader');

    await expect(loader).toHaveClass(/hidden/);

    await page.locator('nav a[href="/projects/"]').first().click();

    await expect(page).toHaveURL(/\/projects\/$/);

    await expect(loader).toHaveClass(/hidden/);
  });

  test('SPA navigation still hits the SSR endpoint and returns server-rendered HTML', async ({ page, request }) => {
    const responses: string[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/journey/') && response.request().method() === 'GET') {
        const body = await response.text();

        if (body.includes('Engineering Journey')) {
          responses.push(body);
        }
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('nav a[href="/journey/"]').first().click();
    await expect(page).toHaveURL(/\/journey\/$/);

    expect(responses.length).toBeGreaterThanOrEqual(1);
    expect(responses[0]).toContain('Engineering Journey');

    const directResponse = await request.get('/journey/');
    const directBody = await directResponse.text();

    expect(directBody).toContain('Engineering Journey');
  });
});

test.describe('background webgl renderer', () => {
  test('the three.js bundle is loaded once on the home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const scriptCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[type="module"][src*="background"]')).length;
    });

    expect(scriptCount).toBeGreaterThanOrEqual(1);
  });

  test('canvas is appended inside #dark-bg', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(() => {
      return Boolean(document.querySelector('#dark-bg canvas'));
    });
  });

  test('no js errors are logged while interacting with the home page', async ({ page }) => {
    const errors = observeConsoleErrors(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(300);

    const filteredErrors = errors.filter((error) => !error.includes('Failed to load resource'));

    expect(filteredErrors).toEqual([]);
  });
});
