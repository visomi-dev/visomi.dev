import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';

const execute = promisify(execFile);

test.setTimeout(180000);

test('all 40 public views preserve baseline content, SEO, geometry and approved contrast', async ({ baseURL }) => {
  const result = await execute(process.execPath, ['scripts/website-parity.mjs', 'compare'], {
    cwd: workspaceRoot,
    env: { ...process.env, PARITY_URL: baseURL!, PARITY_ACCESSIBILITY_BASELINE: 'false' },
    timeout: 150000,
    maxBuffer: 1024 * 1024,
  });

  expect(result.stdout).toContain('40 parity cases passed');
});
