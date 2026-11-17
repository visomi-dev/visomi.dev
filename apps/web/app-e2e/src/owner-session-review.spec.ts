import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test, type APIResponse, type Page, type Route } from '@playwright/test';

async function openOwnerPage(page: Page, origin: string, role: string, path = '/app/en/admin/dashboard') {
  const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(origin).port}`);
  const contents = await readFile(resolve(directory, 'session.json'), 'utf8');
  const fixture = JSON.parse(contents);

  await page.context().addCookies([
    {
      name: '__Host-visomi.sid',
      value: encodeURIComponent(fixture.cookies[role]),
      url: origin,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    },
  ]);

  const connected = page.waitForEvent('websocket').then((socket) =>
    socket.waitForEvent('framereceived', {
      predicate: (frame) => typeof frame.payload === 'string' && frame.payload.startsWith('40/session'),
    }),
  );

  await page.goto(path);

  await connected;
}

for (const { failure, role, respond } of [
  { failure: 'network', role: 'logoutNetworkOwner', respond: (route: Route) => route.abort('failed') },
  {
    failure: 'server',
    role: 'logoutServerOwner',
    respond: (route: Route) => route.fulfill({ status: 500, json: { error: 'synthetic_failure' } }),
  },
]) {
  test(`a ${failure} logout failure stays visible and can be retried while the server session remains active`, async ({
    page,
    baseURL,
    browserName,
  }) => {
    await openOwnerPage(page, baseURL!, `${role}-${browserName}`);

    await expect(page.locator('article')).toHaveCount(25);

    await page.route('**/api/auth/logout', respond);

    await page.getByRole('button', { name: 'Sign out', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Access could not be verified. Please try again.');

    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await expect(page.locator('article')).toHaveCount(25);

    const active = await page.request.get('/api/auth/session');
    const session = await active.json();

    expect(session.authenticated).toBe(true);

    await page.unroute('**/api/auth/logout');

    await page.getByRole('button', { name: 'Sign out', exact: true }).click();

    await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

    await expect(page.locator('article')).toHaveCount(0);

    const signedOut = await page.request.get('/api/auth/session');
    const anonymous = await signedOut.json();

    expect(anonymous.authenticated).toBe(false);
  });
}

test('expiration on contact detail removes private data and redirects instead of leaving access verification pending', async ({
  page,
  baseURL,
  browserName,
}) => {
  await openOwnerPage(page, baseURL!, `detailExpiryOwner-${browserName}`, '/app/en/admin/contacts/1');

  await expect(page.locator('article')).toContainText('Synthetic pagination message');

  const current = await page.request.get('/api/auth/session');
  const session = await current.json();
  const logout = await page.request.post('/api/auth/logout', {
    data: {},
    headers: { 'x-csrf-token': session.csrfToken, origin: new URL(page.url()).origin },
  });

  expect(logout.ok()).toBe(true);

  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.locator('article')).toHaveCount(0);

  const denied = await page.request.get('/api/contact/submissions/1');

  expect(denied.status()).toBe(401);
});

type ContactPayload = { items: { name: string }[] } | { item: { name: string } };

function expectedContacts(payload: ContactPayload) {
  return 'items' in payload ? payload.items : [payload.item];
}

for (const { navigation, role, pattern, link, url } of [
  {
    navigation: 'pagination',
    role: 'paginationFocusOwner',
    pattern: '**/api/contact/submissions?*',
    link: (page: Page) => page.getByRole('link', { name: 'Older requests' }),
    url: /\/admin\/dashboard\?before=/,
  },
  {
    navigation: 'detail',
    role: 'detailFocusOwner',
    pattern: '**/api/contact/submissions/*',
    link: (page: Page) => page.locator('article a').first(),
    url: /\/admin\/contacts\/\d+$/,
  },
]) {
  test(`focus preserves an authorized delayed ${navigation} response and completes navigation with data`, async ({
    page,
    baseURL,
    browserName,
  }) => {
    await openOwnerPage(page, baseURL!, `${role}-${browserName}`);

    await expect(page.locator('article')).toHaveCount(25);

    let release: () => void = () => undefined;
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    let capture: (response: APIResponse) => void = () => undefined;
    const captured = new Promise<APIResponse>((resolve) => {
      capture = resolve;
    });

    await page.route(pattern, async (route) => {
      const response = await route.fetch();

      capture(response);

      await blocked;

      await route.fulfill({ response }).catch(() => undefined);
    });

    await link(page).click({ noWaitAfter: true });

    try {
      const response = await captured;

      expect(response.status()).toBe(200);

      const payload: ContactPayload = await response.json();
      const contacts = expectedContacts(payload);

      expect(contacts.length).toBeGreaterThan(0);
      const checked = page.waitForResponse((response) => response.url().endsWith('/api/auth/session'));
      const ownership = page.waitForResponse((response) => response.url().endsWith('/api/contact/session'));

      await page.evaluate(() => window.dispatchEvent(new Event('focus')));

      const sessionResponse = await checked;
      const ownerResponse = await ownership;

      expect(sessionResponse.status()).toBe(200);
      expect(ownerResponse.status()).toBe(200);

      const activeSession = await page.request.get('/api/auth/session');
      const session = await activeSession.json();
      const activeOwner = await page.request.get('/api/contact/session');
      const owner = await activeOwner.json();

      expect(session.authenticated).toBe(true);
      expect(owner.owner).toBe(true);
      release();

      await expect(page).toHaveURL(url);

      await expect(page.locator('article')).toHaveCount(contacts.length);

      await expect(page.locator('article').first()).toContainText(contacts[0].name);

      await expect(page.getByRole('alert')).toHaveCount(0);
    } finally {
      release();
    }
  });
}
