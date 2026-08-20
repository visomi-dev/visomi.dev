import { expect, test } from '@playwright/test';

const prerenderedPaths = [
  '/',
  '/journey/',
  '/projects/',
  '/resume/',
  '/es/',
  '/es/journey/',
  '/es/projects/',
  '/es/resume/',
] as const;

const ssgOnlyPaths = ['/', '/journey/', '/projects/', '/resume/', '/es/'] as const;

test.describe('prerendered pages', () => {
  for (const path of prerenderedPaths) {
    test(`html is served for ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

      expect(response?.ok()).toBeTruthy();
      expect(response?.headers()['content-type']).toContain('text/html');
    });

    test(`cache-control + etag are set on ${path}`, async ({ request }) => {
      const first = await request.get(path);

      expect(first.status()).toBe(200);
      expect(first.headers()['cache-control']).toContain('max-age=300');
      expect(first.headers()['cache-control']).toContain('s-maxage=3600');
      expect(first.headers()['cache-control']).toContain('stale-while-revalidate');
      expect(first.headers()['etag']).toBeTruthy();
      expect(first.headers()['x-content-type-options']).toBe('nosniff');
    });

    test(`etag round-trip returns 304 for ${path}`, async ({ request }) => {
      const first = await request.get(path);
      const etag = first.headers()['etag'];

      expect(etag).toBeTruthy();

      const second = await request.get(path, { headers: { 'If-None-Match': etag ?? '' } });

      expect(second.status()).toBe(304);
    });
  }
});

test.describe('ssr-only contact page', () => {
  test('/contact/ is rendered by the SSR middleware', async ({ request }) => {
    const response = await request.get('/contact/');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    expect(response.headers()['cache-control']).toContain('private');
    expect(response.headers()['cache-control']).toContain('no-store');
  });

  test('/es/contact/ is rendered by the SSR middleware', async ({ request }) => {
    const response = await request.get('/es/contact/');

    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('private');
  });

  test('the contact page form is interactive after navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.locator('nav a[href="/contact/"]').first().click();
    await expect(page).toHaveURL(/\/contact\/$/);

    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });
});

test.describe('ssg output layout', () => {
  for (const path of ssgOnlyPaths) {
    test(`html response carries the same markup across reloads (${path})`, async ({ request }) => {
      const first = await request.get(path);
      const second = await request.get(path, { headers: { 'Cache-Control': 'no-cache' } });

      const firstBody = await first.text();
      const secondBody = await second.text();

      expect(firstBody).toBe(secondBody);
    });
  }
});
