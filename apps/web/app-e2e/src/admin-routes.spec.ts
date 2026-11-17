import { expect, test } from '@playwright/test';

for (const locale of ['en', 'es']) {
  test(`${locale} retired, bare and unknown administrative routes return a real localized 404`, async ({ request }) => {
    for (const route of [
      'admin',
      'access',
      'dashboard',
      'metrics',
      'admin/dashboard/extra',
      'admin/auth/sign-in/extra',
      'admin/unknown',
    ]) {
      const response = await request.get(`/app/${locale}/${route}`, {
        headers: { accept: 'text/html' },
        maxRedirects: 0,
      });

      expect(response.status(), route).toBe(404);
      expect(response.headers()['location']).toBeUndefined();
      expect(response.headers()['cache-control']).toContain('no-store');
      const html = await response.text();

      expect(html).toContain(locale === 'es' ? 'Página no encontrada' : 'Page not found');
      expect(html).not.toContain('Synthetic request');
    }
  });
}

test('human public errors use portfolio HTML while API errors remain JSON', async ({ request }) => {
  for (const [path, title] of [
    ['/missing-public-page/', 'Page not found'],
    ['/es/missing-public-page/', 'Página no encontrada'],
  ]) {
    const html = await request.get(path, { headers: { accept: 'text/html' } });

    expect(html.status()).toBe(404);
    expect(html.headers()['content-type']).toContain('text/html');
    expect(html.headers()['cache-control']).toContain('no-store');
    const body = await html.text();

    expect(body).toContain(title);
    const json = await request.get(path, { headers: { accept: 'application/json' } });

    expect(json.status()).toBe(404);
    expect(json.headers()['content-type']).toContain('application/json');
  }
  const api = await request.get('/api/missing', { headers: { accept: 'text/html' } });

  expect(api.status()).toBe(404);
  expect(api.headers()['content-type']).toContain('application/json');
  const internal = await request.get('/en/system-errors/500/', { headers: { accept: 'text/html' } });

  expect(internal.status()).toBe(404);
});
