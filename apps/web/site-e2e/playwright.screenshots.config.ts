import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] ?? 'http://127.0.0.1:8183';

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
    command: 'pnpm exec tsx --tsconfig tsconfig.base.json tools/testing/browser-server.ts',
    url: 'http://127.0.0.1:8183/api/ready',
    env: { VISOMI_E2E_PORT: '8183' },
    reuseExistingServer: false,
    timeout: 120000,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
