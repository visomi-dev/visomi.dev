import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';

for (const { locale, heading, missing, theme } of [
  { locale: 'en', heading: 'Owner sign-in', missing: 'Page not found', theme: 'Dark theme' },
  { locale: 'es', heading: 'Ingreso del propietario', missing: 'Página no encontrada', theme: 'Tema oscuro' },
]) {
  test(`${locale} SSR uses the agreed sign-in path and rejects legacy compatibility for every identity`, async ({
    request,
    baseURL,
    browserName,
  }) => {
    const canonical = `/app/${locale}/admin/auth/sign-in`;
    const response = await request.get(canonical, { headers: { accept: 'text/html' }, maxRedirects: 0 });
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()['location']).toBeUndefined();
    expect(response.headers()['cache-control']).toBe('private, no-store');
    expect(html).toContain(heading);
    expect(html).toContain(`base href="/app/${locale}/"`);
    expect(html).toContain('ng-server-context="ssr"');

    for (const route of ['admin/dashboard', 'admin/contacts/1', 'admin/metrics']) {
      const guarded = await request.get(`/app/${locale}/${route}`, {
        headers: { accept: 'text/html' },
        maxRedirects: 0,
      });
      const body = await guarded.text();

      expect(guarded.status()).toBe(302);
      expect(guarded.headers()['location']).toBe(canonical);
      expect(guarded.headers()['cache-control']).toBe('private, no-store');
      expect(body).toBe('');
    }

    for (const route of [
      'access',
      'access/',
      'access/extra',
      'access?returnUrl=/admin/auth/sign-in',
      '%61ccess',
      'sign-in',
      'auth/sign-in',
      'admin/access',
    ]) {
      const legacy = await request.get(`/app/${locale}/${route}`, {
        headers: { accept: 'text/html' },
        maxRedirects: 0,
      });
      const body = await legacy.text();

      expect(legacy.status(), route).toBe(404);
      expect(legacy.headers()['location']).toBeUndefined();
      expect(legacy.headers()['cache-control']).toBe('private, no-store');
      expect(body).toContain(missing);
      expect(body).not.toContain('id="password"');
      expect(body).not.toContain('Synthetic request');
    }

    const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);
    const contents = await readFile(resolve(directory, 'session.json'), 'utf8');
    const fixture = JSON.parse(contents);

    for (const { role, owned } of [
      { role: 'owner', owned: true },
      { role: 'other', owned: false },
    ]) {
      const credentials = {
        cookie: `__Host-visomi.sid=${encodeURIComponent(fixture.cookies[`${role}-${browserName}`])}`,
      };
      const identity = await request.get('/api/auth/session', { headers: credentials });
      const session = await identity.json();
      const ownership = await request.get('/api/contact/session', { headers: credentials });
      const authorization = await ownership.json();

      expect(identity.status()).toBe(200);
      expect(session.authenticated).toBe(true);
      expect(ownership.status()).toBe(owned ? 200 : 403);
      expect(authorization).toEqual(owned ? { owner: true } : { error: 'access_denied' });

      const legacy = await request.get(`/app/${locale}/access`, {
        headers: {
          accept: 'text/html',
          ...credentials,
        },
        maxRedirects: 0,
      });
      const body = await legacy.text();

      expect(legacy.status(), role).toBe(404);
      expect(legacy.headers()['location']).toBeUndefined();
      expect(body).toContain(missing);
      expect(body).not.toContain('Synthetic request');
    }
  });

  test(`${locale} client routing never rewrites legacy paths to the sign-in screen`, async ({ page }) => {
    const canonical = `/app/${locale}/admin/auth/sign-in`;
    const documents: string[] = [];

    page.on('request', (request) => {
      if (request.resourceType() === 'document') {
        documents.push(request.url());
      }
    });

    await page.goto(canonical);

    await page.getByRole('button', { name: theme, exact: true }).click();

    await expect(page.getByRole('button', { name: theme, exact: true })).toHaveAttribute('aria-pressed', 'true');

    for (const route of ['access', 'access/extra', 'sign-in', 'auth/sign-in', 'admin/access']) {
      const legacy = `/app/${locale}/${route}`;

      await page.evaluate((path) => {
        history.pushState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, legacy);

      await expect(page.getByRole('heading', { name: missing, exact: true })).toBeVisible();

      await expect(page).toHaveURL(new URL(legacy, page.url()).href);

      await expect(page.locator('input[type="password"]')).toHaveCount(0);

      await page.evaluate((path) => {
        history.pushState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, canonical);

      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();

      await expect(page).toHaveURL(new URL(canonical, page.url()).href);

      await expect(page.getByRole('link', { name: 'English', exact: true })).toHaveAttribute(
        'href',
        '/app/en/admin/auth/sign-in',
      );

      await expect(page.getByRole('link', { name: 'Español', exact: true })).toHaveAttribute(
        'href',
        '/app/es/admin/auth/sign-in',
      );
    }

    for (const route of ['admin/dashboard', 'admin/contacts/1', 'admin/metrics']) {
      const checked = page.waitForResponse((response) => response.url().endsWith('/api/contact/session'));

      await page.evaluate((path) => {
        history.pushState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, `/app/${locale}/${route}`);

      await checked;

      await expect(page).toHaveURL(new URL(canonical, page.url()).href);

      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }

    expect(documents).toHaveLength(1);
  });
}

test('unlocalized legacy URLs never enter Angular or become a sign-in compatibility redirect', async ({ request }) => {
  for (const path of ['/app/access', '/app/access/', '/access/']) {
    const response = await request.get(path, { headers: { accept: 'text/html' }, maxRedirects: 0 });

    expect(response.status(), path).toBe(404);
    expect(response.headers()['location']).toBeUndefined();
    const body = await response.text();

    expect(body).not.toContain('Owner sign-in');
    expect(body).not.toContain('Synthetic request');
  }

  // Public URLs retain the existing generic trailing-slash normalization, ending at 404.
  const normalized = await request.get('/access', { headers: { accept: 'text/html' }, maxRedirects: 0 });

  expect(normalized.status()).toBe(301);
  expect(normalized.headers()['location']).toBe('/access/');
});
