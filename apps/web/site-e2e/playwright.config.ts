import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] ?? 'http://127.0.0.1:8183';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, {
    testDir: './src',
    openHtmlReport: 'never',
  }),
  testIgnore: ['**/website-screenshots-*.spec.ts'],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  workers: 2,
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm exec tsx --tsconfig tsconfig.base.json tools/testing/browser-server.ts',
    url: 'http://127.0.0.1:8183/api/ready',
    env: { VISOMI_E2E_PORT: '8183' },
    reuseExistingServer: false,
    timeout: 120000,
    cwd: workspaceRoot,
  },
  projects:
    process.env['PLAYWRIGHT_BROWSERS'] === 'all'
      ? [
          { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
