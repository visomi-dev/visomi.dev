import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

test('resume print layout hides site chrome and exports an A4 PDF', async ({ page }) => {
  await page.goto('/resume/', { waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('nav')).toBeHidden();
  await expect(page.locator('.site-footer')).toBeHidden();

  const outputDirectory = join(process.cwd(), 'artifacts/apps/web/site-e2e/print');
  await mkdir(outputDirectory, { recursive: true });

  await page.pdf({
    path: join(outputDirectory, 'resume-en-a4.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', right: '16mm', bottom: '14mm', left: '16mm' },
  });
});
