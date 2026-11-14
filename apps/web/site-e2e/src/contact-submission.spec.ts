import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test, type Page } from '@playwright/test';

async function useHttpsIngress(page: Page, baseURL: string, mode: string) {
  if (mode === 'direct') {
    return;
  }

  // The browser sees HTTPS; every public-origin request is fulfilled by the local fixture.
  await page.route('https://visomi.dev/**', async (route) => {
    const destination = new URL(route.request().url());
    const response = await route.fetch({
      url: `${baseURL}${destination.pathname}${destination.search}`,
      headers: { ...route.request().headers(), 'x-forwarded-proto': 'https', 'x-forwarded-host': 'visomi.dev' },
      maxRedirects: 0,
    });

    await route.fulfill({ response });
  });
}

for (const mode of ['direct', 'https-proxy']) {
  const publicOrigin = mode === 'direct' ? '' : 'https://visomi.dev';

  for (const locale of ['en', 'es']) {
    test(`the ${locale} ${mode} public form persists its full message through Astro and the protected PostgreSQL API`, async ({
      page,
      request,
      baseURL,
    }) => {
      const message = `Synthetic ${locale} ${mode} public contact end-to-end message.`;

      await useHttpsIngress(page, baseURL!, mode);

      await page.goto(`${publicOrigin}${locale === 'en' ? '/contact/' : '/es/contact/'}`);

      await page.locator('#name').fill('Synthetic public requester');

      await page.locator('#email').fill(`public-${mode}-${locale}@example.test`);

      await page.locator('#type').selectOption('consulting');

      await page.locator('#message').fill(message);

      await page.locator('form button[type="submit"]').click();

      await expect(
        page.getByText(
          locale === 'es' ? 'Mensaje enviado. Te respondere pronto.' : 'Message sent. I will get back to you soon.',
        ),
      ).toBeVisible();

      const awaitedResult1 = await readFile(
        resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`, 'session.json'),
        'utf8',
      );
      const fixture = JSON.parse(awaitedResult1);
      const headers = { cookie: `visomi.sid=${encodeURIComponent(fixture.cookies.owner)}` };
      const response = await request.get('/api/contact/submissions?limit=100', { headers });

      expect(response.status()).toBe(200);
      const result = await response.json();
      const item = result.items.find((row: { email: string }) => row.email === `public-${mode}-${locale}@example.test`);

      expect(item).toMatchObject({
        email: `public-${mode}-${locale}@example.test`,
        locale,
        name: 'Synthetic public requester',
        type: 'consulting',
      });
      const detail = await request.get(`/api/contact/submissions/${item.id}`, { headers });
      const value = await detail.json();

      expect(value.item.message).toBe(message);
      expect(detail.headers()['cache-control']).toContain('no-store');
    });
  }
}

for (const host of ['visomi.dev', 'untrusted.example.test']) {
  test(`public contact rejects a cross-origin form with forwarded host ${host}`, async ({ request }) => {
    const response = await request.post('/contact/?_action=contact', {
      headers: { origin: 'https://untrusted.example.test', 'x-forwarded-proto': 'https', 'x-forwarded-host': host },
      form: {},
    });

    expect(response.status()).toBe(403);
  });
}
