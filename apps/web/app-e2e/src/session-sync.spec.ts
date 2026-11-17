import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test, type APIResponse, type Page } from '@playwright/test';

async function authenticate(page: Page, baseURL: string, role: string) {
  const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL).port}`);
  const content = await readFile(resolve(directory, 'session.json'), 'utf8');
  const fixture = JSON.parse(content);

  await page.context().addCookies([
    {
      name: '__Host-visomi.sid',
      value: encodeURIComponent(fixture.cookies[role]),
      url: baseURL,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    },
  ]);
}

async function revoke(page: Page) {
  const response = await page.request.get('/api/auth/session');
  const session = await response.json();
  const result = await page.request.post('/api/auth/logout', {
    data: {},
    headers: { 'x-csrf-token': session.csrfToken, origin: new URL(page.url()).origin },
  });

  expect(result.ok()).toBe(true);
}

test('logout removes private data from another open tab immediately', async ({ page, baseURL, browserName }) => {
  await authenticate(page, baseURL!, `syncOwner-${browserName}`);

  await page.goto('/app/en/admin/dashboard');

  await expect(page.locator('article')).toHaveCount(25);

  const second = await page.context().newPage();

  await second.goto('/app/en/admin/dashboard');

  await expect(second.locator('article')).toHaveCount(25);

  await second.getByRole('button', { name: 'Sign out', exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.locator('article')).toHaveCount(0);

  await expect(second).toHaveURL(/\/admin\/auth\/sign-in$/);

  const denied = await page.request.get('/api/contact/submissions');

  expect(denied.status()).toBe(401);
});

test('focus revalidates expiry without BroadcastChannel or a realtime connection', async ({
  page,
  baseURL,
  browserName,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'BroadcastChannel', { value: undefined });
  });

  await page.routeWebSocket('**/socket.io/**', (socket) => socket.close());

  await authenticate(page, baseURL!, `focusOwner-${browserName}`);

  await page.goto('/app/en/admin/dashboard');

  await expect(page.locator('article')).toHaveCount(25);

  await revoke(page);

  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.locator('article')).toHaveCount(0);
});

test('the existing realtime session channel clears revoked data without a tab notice', async ({
  page,
  baseURL,
  browserName,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'BroadcastChannel', { value: undefined });
  });

  await authenticate(page, baseURL!, `realtimeOwner-${browserName}`);

  const connected = page.waitForEvent('websocket').then((socket) =>
    socket.waitForEvent('framereceived', {
      predicate: (frame) => typeof frame.payload === 'string' && frame.payload.startsWith('40/session'),
    }),
  );

  await page.goto('/app/en/admin/dashboard');

  await connected;

  await expect(page.locator('article')).toHaveCount(25);

  await revoke(page);

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.locator('article')).toHaveCount(0);
});

test('a late private response after logout never restores contact data', async ({ page, baseURL, browserName }) => {
  await authenticate(page, baseURL!, `lateOwner-${browserName}`);

  const connected = page.waitForEvent('websocket').then((socket) =>
    socket.waitForEvent('framereceived', {
      predicate: (frame) => typeof frame.payload === 'string' && frame.payload.startsWith('40/session'),
    }),
  );

  await page.goto('/app/en/admin/dashboard');

  await connected;

  await expect(page.locator('article')).toHaveCount(25);

  let release: () => void = () => undefined;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  let capture: (response: APIResponse) => void = () => undefined;
  const captured = new Promise<APIResponse>((resolve) => {
    capture = resolve;
  });

  await page.route('**/api/contact/submissions?*', async (route) => {
    const response = await route.fetch();

    capture(response);

    await blocked;

    await route.fulfill({ response }).catch(() => undefined);
  });

  await page.getByRole('link', { name: 'Older requests' }).click({ noWaitAfter: true });

  const response = await captured;

  expect(response.status()).toBe(200);
  const payload = await response.json();

  expect(payload.items.length).toBeGreaterThan(0);

  await revoke(page);

  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  release();

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.locator('article')).toHaveCount(0);
});
