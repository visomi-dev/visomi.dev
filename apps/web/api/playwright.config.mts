import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),
  testMatch: '**/*.e2e.spec.ts',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:8185', trace: 'off' },
  webServer: {
    command: 'pnpm exec tsx --tsconfig tsconfig.base.json tools/testing/browser-server.ts',
    url: 'http://127.0.0.1:8185/ready',
    timeout: 120000,
    reuseExistingServer: false,
    cwd: workspaceRoot,
    env: { VISOMI_E2E_PORT: '8185', VISOMI_E2E_RUNTIME: 'web-api' },
  },
  projects: [{ name: 'web-api' }],
});
