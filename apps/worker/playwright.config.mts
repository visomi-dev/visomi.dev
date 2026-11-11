import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),
  testMatch: '**/*.e2e.spec.ts',
  workers: 1,
  // This scenario restarts its owned Redis service; retries need a fresh fixture, not stale connections.
  retries: 0,
  timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:8187', trace: 'off' },
  webServer: {
    command: 'pnpm exec tsx --tsconfig tsconfig.base.json tools/testing/worker-server.ts',
    url: 'http://127.0.0.1:8187/api/health',
    timeout: 120000,
    reuseExistingServer: false,
    cwd: workspaceRoot,
  },
});
