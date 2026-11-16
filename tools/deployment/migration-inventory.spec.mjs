import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { inspectInventory } from './migration-inventory.mjs';

const contents = await readFile(new URL('../../docs/migration/stack-files.json', import.meta.url), 'utf8');
const inventory = JSON.parse(contents);

test('preserves complete baseline coverage, accurate counts and existing destinations', async () => {
  const result = await inspectInventory(inventory);

  assert.deepEqual(result.errors, []);
});

test('rejects broken counts, missing destinations, duplicate sources and changed baseline hashes', async () => {
  for (const change of [
    (value) => {
      value.counts.adapted++;
    },
    (value) => {
      value.files.find((entry) => entry.destination).destination = 'synthetic-missing-inventory-file';
    },
    (value) => {
      value.files[1].source = value.files[0].source;
    },
    (value) => {
      value.files[0].sourceSha256 = '0'.repeat(64);
    },
  ]) {
    const changed = structuredClone(inventory);

    change(changed);
    const result = await inspectInventory(changed);

    assert.ok(result.errors.length > 0);
  }
});

test('reports destination drift separately so future code can evolve without erasing provenance', async () => {
  const changed = structuredClone(inventory);
  const entry = changed.files.find((entry) => entry.destination);

  entry.destinationSha256 = '0'.repeat(64);
  const result = await inspectInventory(changed);

  assert.deepEqual(result.errors, []);
  assert.ok(result.drift.includes(entry.destination));
});
