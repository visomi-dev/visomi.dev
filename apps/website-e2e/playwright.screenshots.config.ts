import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(__filename, {
    testDir: './src',
    openHtmlReport: 'never',
  }),
  testMatch: ['**/website-screenshots-*.spec.ts'],
  fullyParallel: false,
  workers: Number.parseInt(process.env['PLAYWRIGHT_SCREENSHOT_WORKERS'] ?? '1', 10),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec astro preview --root apps/website --host 0.0.0.0 --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
