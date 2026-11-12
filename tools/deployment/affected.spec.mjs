import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../', import.meta.url));
const cases = [
  ['styles.base.css', 'e2e', ['worker']],
  ['libs/web/frontend/ui/src/lib/forms.ts', 'e2e', []],
  ['libs/web/frontend/ui/src/lib/forms.ts', 'lint', ['web-frontend-ui']],
  ['libs/web/frontend/ui/src/lib/forms.ts', 'container-check', ['web-gateway']],
  ['apps/web/app/src/app/pages/dashboard/dashboard.ts', 'e2e', ['app-e2e', 'site-e2e', 'web-gateway', 'worker']],
  ['apps/web/site/src/components/theme-switcher.astro', 'e2e', ['app-e2e', 'site-e2e', 'web-gateway', 'worker']],
  ['apps/web/gateway/src/app.ts', 'e2e', ['app-e2e', 'site-e2e', 'web-gateway', 'worker']],
  ['apps/web/api/src/app.ts', 'e2e', ['app-e2e', 'site-e2e', 'web-api', 'web-gateway', 'worker']],
  ['.railway/railway.ts', 'deployment-check', ['web-gateway']],
  ['.railway/jaeger.yaml', 'container-check', ['web-gateway']],
  ['.railway/jaeger.yaml', 'jaeger-check', ['web-gateway']],
  ['tools/deployment/smoke.mjs', 'deployment-check', ['web-gateway']],
  ['tools/deployment/smoke.mjs', 'container-check', ['web-gateway']],
  ['libs/backend/shared/src/lib/database/database.ts', 'container-check', ['web-gateway']],
  ['Dockerfile', 'container-check', ['web-gateway']],
  ['apps/web/app/src/app/app.ts', 'container-check', ['web-gateway']],
  ['README.md', 'e2e', []],
  ['README.md', 'test', []],
  ['.github/workflows/ci.yml', 'e2e', ['app-e2e', 'site-e2e', 'web-api', 'web-gateway', 'worker']],
];

for (const [file, target, expected] of cases) {
  test(`${file} selects the required ${target} projects`, () => {
    const result = execFileSync(
      'pnpm',
      ['nx', 'show', 'projects', '--affected', '-t', target, '--files', file, '--json'],
      {
        cwd,
        env: { ...process.env, NX_DAEMON: 'false' },
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    assert.deepEqual(JSON.parse(result).sort(), expected);
  });
}
