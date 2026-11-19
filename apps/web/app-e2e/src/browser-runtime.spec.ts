import { expect, test } from '@playwright/test';

test('the compiled Angular entrypoint runs in a clean browser profile', async ({ page }) => {
  const errors: string[] = [];
  let telemetryRequests = 0;

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text().slice(0, 300));
    }
  });
  page.on('requestfailed', (request) =>
    errors.push(new URL(request.url()).pathname + ': ' + request.failure()?.errorText),
  );
  page.on('pageerror', (error) => errors.push(error.name + ': ' + error.message.slice(0, 180)));
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/telemetry/')) {
      telemetryRequests++;
    }
  });

  await page.goto('/app/en/admin/auth/sign-in');

  await expect(page.getByRole('region', { name: 'Privacy settings' })).toBeVisible();

  expect({ telemetryRequests, errors }).toEqual({ telemetryRequests: 0, errors: [] });
});
