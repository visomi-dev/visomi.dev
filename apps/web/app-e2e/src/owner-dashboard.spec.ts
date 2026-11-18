import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';

async function enterSyntheticCode(page: Page, verification: Locator, browserName: string) {
  if (browserName !== 'chromium') {
    await verification.fill('001234');

    return;
  }

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.evaluate(() => navigator.clipboard.writeText('001234'));

  await verification.focus();

  await verification.press('ControlOrMeta+V');
}

test('anonymous users and authenticated non-owners cannot open requests', async ({
  page,
  request,
  baseURL,
  browserName,
}) => {
  const denied = await request.get('/api/contact/submissions/1');

  expect(denied.status()).toBe(401);
  const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);
  const awaitedResult1 = await readFile(resolve(directory, 'session.json'), 'utf8');
  const data = JSON.parse(awaitedResult1);

  await page.context().addCookies([
    {
      name: '__Host-visomi.sid',
      value: encodeURIComponent(data.cookies[`other-${browserName}`]),
      url: baseURL!,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    },
  ]);

  await page.goto('/app/en/admin/dashboard');

  await expect(page).toHaveURL(/\/app\/en\/admin\/auth\/sign-in$/);

  await expect(page.getByText('Owner access required.')).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);
  const forbidden = await page.request.get('/api/contact/submissions/1');

  expect(forbidden.status()).toBe(403);
  expect(forbidden.headers()['cache-control']).toContain('no-store');
});

test('the owner reads paginated requests and escaped message content from the production API', async ({
  page,
  baseURL,
  browserName,
}) => {
  const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);
  const awaitedResult2 = await readFile(resolve(directory, 'session.json'), 'utf8');
  const data = JSON.parse(awaitedResult2);

  await page.context().addCookies([
    {
      name: '__Host-visomi.sid',
      value: encodeURIComponent(data.cookies[`owner-${browserName}`]),
      url: baseURL!,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    },
  ]);

  const message = '<img src=x onerror="window.contactXss=true"> Synthetic browser request';
  const sent = await page.request.post('/api/contact/submissions', {
    data: {
      name: `Browser request ${browserName}`,
      email: 'browser@example.test',
      locale: 'en',
      type: 'other',
      message,
    },
  });

  expect(sent.status()).toBe(201);

  await page.goto('/app/en/admin/dashboard');

  await expect(page.locator('article')).toHaveCount(25);

  await page.getByRole('link', { name: 'Older requests' }).click();

  await expect(page.getByRole('link', { name: 'Synthetic request 1', exact: true })).toBeVisible();

  await page.goto('/app/en/admin/dashboard');

  await page.getByRole('link', { name: `Browser request ${browserName}`, exact: true }).click();

  await expect(page.getByText(message, { exact: true })).toBeVisible();

  await expect(page.locator('article img')).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);
  const executed = await page.evaluate(() => Boolean((window as unknown as Record<string, unknown>)['contactXss']));

  expect(executed).toBe(false);

  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/app\/en\/admin\/auth\/sign-in$/);

  const revoked = await page.request.get('/api/contact/submissions');

  expect(revoked.status()).toBe(401);
});

test('private access completes the stack password and email second-factor flow', async ({
  page,
  baseURL,
  browserName,
}, info) => {
  const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);

  await page.goto('/app/en/admin/auth/sign-in');

  await page.getByLabel('Verified email').fill('owner@example.test');

  await page.getByLabel('Password', { exact: true }).fill('Synthetic password 42!');

  await page.getByRole('button', { name: 'Access dashboard' }).click();

  const verification = page.getByLabel('Verification code');

  await expect(verification).toBeVisible();

  await expect(verification).toHaveAttribute('autocomplete', 'one-time-code');

  await expect(verification).toHaveAttribute('inputmode', 'numeric');

  await expect(page.locator('app-pin-input .slot')).toHaveCount(6);

  const accessibility = await new AxeBuilder({ page }).analyze();

  expect(accessibility.violations).toEqual([]);

  await page.screenshot({ path: info.outputPath('verification.png'), animations: 'disabled' });

  await enterSyntheticCode(page, verification, browserName);

  await expect(verification).toHaveValue('001234');

  await verification.press('End');

  await verification.press('Backspace');

  await expect(verification).toHaveValue('00123');

  await expect(page).toHaveURL(/\/admin\/auth\/sign-in$/);

  let code = '';

  await expect
    .poll(async () => {
      const body = await readFile(resolve(directory, 'mail.json'), 'utf8').catch(() => '{}');

      code = JSON.parse(body).code ?? '';

      return code;
    })
    .toMatch(/^\d{6}$/);

  await verification.fill(code);

  await page.getByRole('button', { name: 'Verify access' }).click();

  await expect(page).toHaveURL(/\/app\/en\/admin\/dashboard$/);

  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});

test('the private app keeps the stack Spanish locale without changing public URLs', async ({ page, request }) => {
  await page.goto('/app/es/admin/auth/sign-in');

  await expect(page.getByRole('heading', { name: 'Ingreso del propietario' })).toBeVisible();

  await expect(page.getByLabel('Correo verificado')).toBeVisible();

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  const publicEnglish = await request.get('/');

  expect(publicEnglish.status()).toBe(200);
  expect(publicEnglish.headers()['location']).toBeUndefined();
});
