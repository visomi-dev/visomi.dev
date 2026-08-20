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

  test('SPA navigation fetches the destination page from the server', async ({ page, request }) => {
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

    expect(directResponse.headers()['cache-control']).toContain('max-age=300');
  });

  test('SPA navigation to /contact/ hits the SSR middleware', async ({ page, request }) => {
    const responses: string[] = [];

    page.on('response', async (response) => {
      if (response.url().endsWith('/contact/') && response.request().method() === 'GET') {
        const body = await response.text();

        if (body.includes('name="email"')) {
          responses.push(body);
        }
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('nav a[href="/contact/"]').first().click();
    await expect(page).toHaveURL(/\/contact\/$/);

    expect(responses.length).toBeGreaterThanOrEqual(1);
    expect(responses[0]).toContain('name="email"');

    const directResponse = await request.get('/contact/');
    const directBody = await directResponse.text();

    expect(directBody).toContain('name="email"');
    expect(directResponse.headers()['cache-control']).toContain('no-store');
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

  test('canvas is re-created after SPA navigation away and back', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(document.querySelector('#dark-bg canvas')));

    await page.locator('nav a[href="/journey/"]').first().click();
    await expect(page).toHaveURL(/\/journey\/$/);

    await page.locator('nav a[href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);

    await page.waitForFunction(() => Boolean(document.querySelector('#dark-bg canvas')));

    const canvasCount = await page.evaluate(() => document.querySelectorAll('#dark-bg canvas').length);

    expect(canvasCount).toBe(1);
  });
});

test.describe('theme persistence across SPA navigation', () => {
  test('light theme survives a ClientRouter swap', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      window.localStorage.setItem('theme', 'light');
    });

    await page.locator('nav a[href="/journey/"]').first().click();
    await expect(page).toHaveURL(/\/journey\/$/);

    const htmlClass = await page.evaluate(() => document.documentElement.className);

    expect(htmlClass).not.toContain('dark');
  });

  test('dark theme survives a ClientRouter swap', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      window.localStorage.setItem('theme', 'dark');
    });

    await page.locator('nav a[href="/journey/"]').first().click();
    await expect(page).toHaveURL(/\/journey\/$/);

    const htmlClass = await page.evaluate(() => document.documentElement.className);

    expect(htmlClass).toContain('dark');
  });

  test('theme switcher is interactive after SPA navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.localStorage.setItem('theme', 'dark'));

    await page.locator('nav a[href="/journey/"]').first().click();
    await expect(page).toHaveURL(/\/journey\/$/);

    await page.locator('label.theme-switch-label').first().click();
    await page.waitForTimeout(500);

    const storedTheme = await page.evaluate(() => window.localStorage.getItem('theme'));

    expect(storedTheme).toBe('light');
  });
});
