import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/VISOMI\.DEV/);
  await expect(page.getByRole('heading', { name: /Transforming/i })).toBeVisible();
});
