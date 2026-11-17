import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { TestProject } from 'vitest/node';
import type { TestCompose } from '@visomi-stack/dev-testing/lib/compose';
import { stopTestPostgres } from '@visomi-stack/dev-testing/lib/postgres';

export default async function setup(project: TestProject) {
  const root = await mkdtemp(join(tmpdir(), 'visomi-api-run-'));

  project.provide('postgresRunDirectory', root);

  return async () => {
    const failures: unknown[] = [];
    const slots = await readdir(root);

    for (const slot of slots) {
      try {
        const manifest = await readFile(join(root, slot, 'postgres.json'), 'utf8');
        const owner: { directory: string; compose: TestCompose } = JSON.parse(manifest);

        await stopTestPostgres(owner.directory, owner.compose);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          failures.push(error);
        }
      }
    }

    if (failures.length) {
      throw new AggregateError(failures, 'postgres_fixture_run_cleanup_failed');
    }

    await rm(root, { recursive: true, force: true });
  };
}
