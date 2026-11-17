import { expect, test } from '@playwright/test';

test('the compiled Angular entrypoint runs in a clean browser profile', async ({ page }) => {
  const errors: string[] = [];
  let configured = false;

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text().slice(0, 300));
    }
  });
  page.on('requestfailed', (request) =>
    errors.push(new URL(request.url()).pathname + ': ' + request.failure()?.errorText),
  );
  page.on('pageerror', (error) => errors.push(error.name + ': ' + error.message.slice(0, 180)));
  page.on('response', (response) => {
    if (response.url().endsWith('/telemetry/config')) {
      configured = true;
    }
  });

  await page.goto('/app/en/admin/auth/sign-in');

  await expect.poll(() => ({ configured, errors })).toEqual({ configured: true, errors: [] });
});
