import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
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

  expect(result.status()).toBe(204);
}

async function visitDashboard(page: Page, locale = 'en') {
  // SSR rows precede browser session initialization. Revoke only after that read has settled.
  const authorized = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/contact/session');

  await page.goto(`/app/${locale}/admin/dashboard`);

  const response = await authorized;

  expect(response.status()).toBe(200);
}

for (const [locale, loading, heading, accessHeading, signIn, width] of [
  ['en', 'Checking access…', 'Contact requests', 'Administration', 'Owner sign-in', 1440],
  ['es', 'Comprobando el acceso…', 'Solicitudes de contacto', 'Administración', 'Ingreso del propietario', 390],
] as const) {
  test(`${locale} shell shows its access-check state while the owner session is revalidated`, async ({
    page,
    baseURL,
    browserName,
  }, info) => {
    await page.setViewportSize({ width, height: 844 });

    await page.routeWebSocket('**/socket.io/**', (socket) => socket.close());

    await authenticate(page, baseURL!, `metricsOwner-${browserName}`);

    await visitDashboard(page, locale);

    const content = page.getByRole('heading', { name: heading });
    const shell = page.locator('app-admin-shell');
    const status = shell.getByRole('status').filter({ hasText: loading });
    const header = shell.locator('header[app-topbar]');
    const scroll = shell.locator('main');
    const accessRegion = scroll.locator('[aria-busy]');
    const loader = accessRegion.locator('[aria-hidden=true] .ui-loader');

    await expect(content).toBeVisible();

    const headerBox = await header.boundingBox();
    const scrollBox = await scroll.boundingBox();
    let releaseAccess!: () => void;
    const access = new Promise<void>((resolve) => {
      releaseAccess = resolve;
    });

    await page.route(
      '**/api/contact/session',
      async (route) => {
        await access;

        await route.continue();
      },
      { times: 1 },
    );

    const checking = page.waitForRequest((request) => request.url().endsWith('/api/contact/session'));

    try {
      await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'visomi-session-change' })));

      await checking;

      await expect(accessRegion).toHaveAttribute('aria-busy', 'true');

      await expect(loader).toBeVisible();

      await expect(loader).toHaveCSS('mask-image', /url\(/);

      await expect(accessRegion).toHaveCSS('height', '28px');

      await expect(status).toHaveClass('sr-only');

      await expect(status).toHaveCSS('width', '1px');

      await expect(page.getByText(loading, { exact: true })).toHaveCount(1);

      await expect(content).toHaveCount(0);

      const waitingHeading = page.getByRole('heading', { name: accessHeading, level: 1 });

      await expect(waitingHeading).toHaveClass(/sr-only/);

      await expect(waitingHeading).not.toBeFocused();

      const pendingHeaderBox = await header.boundingBox();
      const pendingScrollBox = await scroll.boundingBox();

      expect(pendingHeaderBox).toEqual(headerBox);
      expect(pendingScrollBox).toEqual(scrollBox);
      const accessibility = await new AxeBuilder({ page }).analyze();

      expect(accessibility.violations).toEqual([]);

      await page.screenshot({ path: info.outputPath(`shell-access-loader-${locale}.png`), animations: 'disabled' });
    } finally {
      releaseAccess();
    }

    await expect(content).toBeVisible();

    await expect(accessRegion).toHaveAttribute('aria-busy', 'false');

    await expect(loader).toHaveCount(0);

    await expect(status).toHaveCount(0);

    const resolvedHeaderBox = await header.boundingBox();
    const resolvedScrollBox = await scroll.boundingBox();

    expect(resolvedHeaderBox).toEqual(headerBox);
    expect(resolvedScrollBox).toEqual(scrollBox);

    await page.route('**/api/contact/session', (route) => route.abort('failed'), { times: 1 });

    await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'visomi-session-change' })));

    await expect(page).toHaveURL(new RegExp(`/app/${locale}/admin/auth/sign-in$`));

    await expect(page.getByRole('heading', { name: signIn })).toBeVisible();

    await expect(shell).toHaveCount(0);

    await expect(page.getByText(loading, { exact: true })).toHaveCount(0);
  });
}

test('seeded authenticated sessions have stable CSRF across concurrent initialization reads', async ({
  page,
  baseURL,
  browserName,
}) => {
  await authenticate(page, baseURL!, `csrfOwner-${browserName}`);

  const responses = await Promise.all(Array.from({ length: 4 }, () => page.request.get('/api/auth/session')));
  const sessions = await Promise.all(responses.map((response) => response.json()));

  expect(responses.every((response) => response.status() === 200)).toBe(true);
  expect(sessions.every((session) => session.authenticated === true)).toBe(true);
  expect(new Set(sessions.map((session) => session.csrfToken)).size).toBe(1);

  const logout = await page.request.post('/api/auth/logout', {
    data: {},
    headers: { 'x-csrf-token': sessions[0].csrfToken, origin: baseURL! },
  });

  expect(logout.status()).toBe(204);
});

test('logout removes private data from another open tab immediately', async ({ page, baseURL, browserName }) => {
  await authenticate(page, baseURL!, `syncOwner-${browserName}`);

  await visitDashboard(page);

  await expect(page.getByRole('table', { name: 'Contact requests' }).locator('tbody tr')).toHaveCount(25);

  const second = await page.context().newPage();

  await visitDashboard(second);

  await expect(second.getByRole('table', { name: 'Contact requests' }).locator('tbody tr')).toHaveCount(25);

  await second.getByRole('button', { name: 'Sign out', exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.getByRole('table', { name: 'Contact requests' })).toHaveCount(0);

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

  await visitDashboard(page);

  await expect(page.getByRole('table', { name: 'Contact requests' }).locator('tbody tr')).toHaveCount(25);

  await revoke(page);

  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.getByRole('table', { name: 'Contact requests' })).toHaveCount(0);
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

  await visitDashboard(page);

  await connected;

  await expect(page.getByRole('table', { name: 'Contact requests' }).locator('tbody tr')).toHaveCount(25);

  await revoke(page);

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  await expect(page.getByRole('table', { name: 'Contact requests' })).toHaveCount(0);
});

test('a late private response after logout never restores contact data', async ({ page, baseURL, browserName }) => {
  await authenticate(page, baseURL!, `lateOwner-${browserName}`);

  const connected = page.waitForEvent('websocket').then((socket) =>
    socket.waitForEvent('framereceived', {
      predicate: (frame) => typeof frame.payload === 'string' && frame.payload.startsWith('40/session'),
    }),
  );

  await visitDashboard(page);

  await connected;

  await expect(page.getByRole('table', { name: 'Contact requests' }).locator('tbody tr')).toHaveCount(25);

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

  await expect(page.getByRole('table', { name: 'Contact requests' })).toHaveCount(0);
});
