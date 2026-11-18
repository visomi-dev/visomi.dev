import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const engine = process.env.CONTAINER_ENGINE || 'docker';
const directory = await mkdtemp(join(tmpdir(), 'visomi-context-check-'));
const tag = `localhost/visomi-context-check:${randomUUID()}`;
const excluded = [
  '.private-operations/audit-sentinel.txt',
  '.qmd/search.sqlite',
  '.codegraph/index.db',
  'apps/web/app/.codegraph/index.db',
  '.playwright-mcp/profile/state.json',
  '.angular/cache/state',
  'artifacts/browser/state.json',
  'tmp/session.json',
  '.env',
];
const included = ['apps/web/app/src/main.ts', 'assets/brand/isotype.svg', '.env.example', '.qmd/index.yml'];

try {
  // Test the actual ignore policy against a wholly synthetic context. Never send a local checkout to the engine.
  await copyFile(new URL('../../.dockerignore', import.meta.url), join(directory, '.dockerignore'));

  for (const path of [...excluded, ...included]) {
    await mkdir(dirname(join(directory, path)), { recursive: true });

    await writeFile(join(directory, path), 'synthetic-context-marker');
  }

  await writeFile(
    join(directory, 'Dockerfile'),
    `FROM scratch\n${included.map((path) => `COPY ${path} /required/${path}`).join('\n')}\n`,
  );

  await execute(engine, ['build', '--quiet', '--tag', tag, directory], { timeout: 60000 });

  for (const path of excluded) {
    await writeFile(join(directory, 'Dockerfile'), `FROM scratch\nCOPY ${path} /forbidden\n`);

    await assert.rejects(
      execute(engine, ['build', '--quiet', directory], { timeout: 60000 }),
      (error) =>
        [1, 125].includes(error.code) &&
        /(?:not found|no such file|excluded|filtered out|not exist)/i.test(error.stderr),
    );
  }
  process.stdout.write('docker_context_isolation_passed\n');
} finally {
  await execute(engine, ['image', 'rm', tag], { timeout: 30000 }).catch(() => undefined);

  await rm(directory, { recursive: true, force: true });
}
