import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { railwayDefinition, watchPatterns } from '../../.railway/railway';

// Railway uses gitignore syntax, including root anchoring. Exercise that syntax with Git itself.
const directory = mkdtempSync(join(tmpdir(), 'visomi-watch-patterns-'));
const gitEnv = {
  ...process.env,
  GIT_DIR: join(directory, '.git'),
  GIT_WORK_TREE: directory,
  GIT_COMMON_DIR: undefined,
  GIT_INDEX_FILE: undefined,
};
const initialized = spawnSync('git', ['init', '--quiet', directory], { env: gitEnv });
const excludes = join(directory, 'empty-excludes');

assert.equal(initialized.status, 0);
writeFileSync(join(directory, '.gitignore'), watchPatterns.join('\n') + '\n');
writeFileSync(excludes, '');
after(() => rmSync(directory, { recursive: true, force: true }));

for (const path of [
  'assets/brand/logotype.svg',
  'assets/brand/isotype.svg',
  'assets/brand/favicon.svg',
  'assets/brand/visomi-loader.svg',
  'assets/brand/wordmark.svg',
  'styles.base.css',
  '.postcssrc.json',
  'railway.json',
  '.railway/railway.ts',
  'apps/web/site/src/styles/global.css',
  'libs/web/frontend/ui/src/lib/shell.ts',
  'patches/astro.patch',
  'tsconfig.base.json',
]) {
  test(`a change only to ${path} triggers the deployment selection`, () => {
    const result = spawnSync(
      'git',
      ['-c', `core.excludesFile=${excludes}`, 'check-ignore', '--no-index', '--quiet', '--', path],
      { cwd: directory, env: gitEnv },
    );

    assert.equal(result.status, 0);
  });
}

for (const path of ['README.md', 'docs/branding/README.md', 'docs/assets/brand/logotype.svg']) {
  test(`unrelated ${path} does not trigger the deployment selection`, () => {
    const result = spawnSync(
      'git',
      ['-c', `core.excludesFile=${excludes}`, 'check-ignore', '--no-index', '--quiet', '--', path],
      { cwd: directory, env: gitEnv },
    );

    assert.equal(result.status, 1);
  });
}

test('the gateway definition preserves the applied build, watch, readiness and restart settings', async () => {
  const {
    resources: [gateway],
  } = await railwayDefinition();

  assert.equal(gateway.build.builder, 'DOCKERFILE');
  assert.equal(gateway.build.dockerfilePath, '/Dockerfile');
  assert.deepEqual(gateway.build.watchPatterns, [
    '/apps/web/**',
    '/apps/worker/**',
    '/assets/**',
    '/libs/**',
    '/tools/**',
    '/patches/**',
    '/package.json',
    '/pnpm-lock.yaml',
    '/pnpm-workspace.yaml',
    '/nx.json',
    '/tsconfig*.json',
    '/.node-version',
    '/styles.base.css',
    '/.postcssrc.json',
    '/railway.json',
    '/Dockerfile',
    '/.dockerignore',
    '/.railway/**',
  ]);
  assert.equal(gateway.deploy.healthcheckPath, '/api/ready');
  assert.equal(gateway.deploy.healthcheckTimeout, 60);
  assert.equal(gateway.deploy.restartPolicyType, 'ON_FAILURE');
  assert.equal(gateway.deploy.restartPolicyMaxRetries, 3);
});
