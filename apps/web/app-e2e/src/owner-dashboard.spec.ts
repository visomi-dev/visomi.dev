import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';

async function enterSyntheticCode(page: Page, verification: Locator, browserName: string) {
  const code = '00 12-34';

  await verification.focus();

  if (browserName !== 'chromium') {
    await verification.evaluate((control, text) => {
      const clipboardData = new DataTransfer();
      const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true });

      clipboardData.setData('text/plain', text);
      Object.defineProperty(paste, 'clipboardData', { value: clipboardData });
      control.dispatchEvent(paste);
    }, code);

    return;
  }

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.evaluate((text) => navigator.clipboard.writeText(text), code);

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

  await expect(page.getByText('This area is for the site owner.', { exact: true })).toBeVisible();

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

  const submit = page.getByRole('button', { name: 'Continue' });

  await page.route(
    '**/api/auth/password/sign-in',
    async (route) => {
      try {
        await expect(submit).toBeDisabled();

        await expect(submit).toHaveAttribute('aria-busy', 'true');

        const mask = await submit.evaluate((element) => getComputedStyle(element, '::after').maskImage);

        expect(mask).toContain('url(');
      } finally {
        await route.continue();
      }
    },
    { times: 1 },
  );

  await submit.click();

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

  const pin = page.locator('app-pin-input');

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 844 });

    await page.evaluate(() => document.fonts.ready);

    const geometry = await pin.evaluate((host) => {
      const field = host.parentElement!.getBoundingClientRect();
      const component = host.getBoundingClientRect();
      const grid = host.querySelector('[aria-hidden=true]')!.getBoundingClientRect();
      const input = host.querySelector('input')!.getBoundingClientRect();
      const cells = Array.from(host.querySelectorAll('.slot'));
      const boxes = cells.map((cell) => cell.getBoundingClientRect());
      const widths = boxes.map((box) => box.width);
      const centers = cells.flatMap((cell, index) => {
        const mask = cell.querySelector('[data-slot=mask]');

        if (!mask) {
          return [];
        }

        const box = boxes[index];
        const dot = mask.getBoundingClientRect();

        return [
          Math.abs(dot.x + dot.width / 2 - box.x - box.width / 2),
          Math.abs(dot.y + dot.height / 2 - box.y - box.height / 2),
        ];
      });

      return {
        edgeOffset: Math.max(
          Math.abs(component.left - field.left),
          Math.abs(component.right - field.right),
          Math.abs(grid.left - component.left),
          Math.abs(grid.right - component.right),
          Math.abs(boxes[0].left - grid.left),
          Math.abs(boxes.at(-1)!.right - grid.right),
          Math.abs(input.left - grid.left),
          Math.abs(input.right - grid.right),
        ),
        widthSpread: Math.max(...widths) - Math.min(...widths),
        centers,
        overflow: host.scrollWidth > host.clientWidth || document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    expect.soft(geometry.edgeOffset, `field, cells and input edges at ${width}px`).toBeLessThan(1);
    expect.soft(geometry.widthSpread, `equal cell widths at ${width}px`).toBeLessThan(1);
    expect.soft(geometry.centers, `individual horizontal and vertical offsets at ${width}px`).toHaveLength(12);
    expect.soft(Math.max(...geometry.centers), `largest centering error at ${width}px`).toBeLessThan(1);
    expect.soft(geometry.overflow, `no horizontal overflow at ${width}px`).toBe(false);

    const responsiveAccessibility = await new AxeBuilder({ page }).analyze();

    expect(responsiveAccessibility.violations).toEqual([]);

    await page.screenshot({ path: info.outputPath(`verification-${width}.png`), animations: 'disabled' });
  }

  await verification.press('Home');

  await verification.press('ArrowRight');

  await verification.press('Shift+ArrowRight');

  const selection = await verification.evaluate((element) => {
    const input = element as HTMLInputElement;

    return [input.selectionStart, input.selectionEnd];
  });

  expect(selection).toEqual([1, 2]);

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

  await page.getByRole('button', { name: 'Verify code' }).click();

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
