import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] ?? 'http://localhost:8080';

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
    command: `set -a; . ${workspaceRoot}/.env; set +a; DISABLE_WORKER=true pnpm exec nx run server:serve`,
    url: 'http://localhost:8080/healthz',
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
