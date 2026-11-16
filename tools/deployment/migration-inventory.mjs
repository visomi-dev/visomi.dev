import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourceDigest = '8eb976c1960770412d8a1b19738c44eef76ae1b4cf824f514ddf80c9fb4106b5';
const sha = (value) => createHash('sha256').update(value).digest('hex');
const safe = (value) =>
  typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.split('/').includes('..');

export async function inspectInventory(inventory) {
  const errors = [];
  const drift = [];
  const counts = { copied: 0, adapted: 0, excluded: 0 };
  const sources = new Set();

  for (const entry of inventory.files) {
    if (!safe(entry.source) || sources.has(entry.source)) {
      errors.push('source_invalid');
    }

    sources.add(entry.source);

    if (!Object.hasOwn(counts, entry.action)) {
      errors.push('action_invalid');
      continue;
    }

    counts[entry.action]++;

    if (!/^[a-f0-9]{64}$/.test(entry.sourceSha256)) {
      errors.push('source_hash_invalid');
    }

    if (entry.action === 'excluded') {
      if (!entry.reason || !entry.scope) {
        errors.push('exclusion_unclassified');
      }

      continue;
    }

    if (!safe(entry.destination) || !/^[a-f0-9]{64}$/.test(entry.destinationSha256)) {
      errors.push('destination_invalid');
      continue;
    }

    try {
      const contents = await readFile(resolve(root, entry.destination));

      // A digest records provenance at a review point. Code may evolve without rewriting historical evidence.
      if (sha(contents) !== entry.destinationSha256) {
        drift.push(entry.destination);
      }
    } catch {
      errors.push('destination_missing');
    }
  }
  // Use byte ordering so the historical digest is independent of ICU and locale.
  const byteDigest = sha(
    [...inventory.files]
      .sort((a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : 0))
      .map((entry) => `${entry.source}\0${entry.sourceSha256}\n`)
      .join(''),
  );

  if (
    inventory.stackRef !== '07f03a567f994aa4c2abdd22346b2f8e6b09c786' ||
    sources.size !== 1127 ||
    byteDigest !== sourceDigest ||
    inventory.integrity.sourceDigest !== sourceDigest
  ) {
    errors.push('baseline_coverage_invalid');
  }

  for (const action of Object.keys(counts)) {
    if (counts[action] !== inventory.counts[action]) {
      errors.push('counts_invalid');
    }
  }

  return { errors, drift: [...new Set(drift)], counts, sourceDigest: byteDigest };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const contents = await readFile(new URL('../../docs/migration/stack-files.json', import.meta.url), 'utf8');
  const inventory = JSON.parse(contents);
  const result = await inspectInventory(inventory);

  process.stdout.write(
    JSON.stringify({ errors: result.errors, counts: result.counts, drift: result.drift.length }) + '\n',
  );
  process.exitCode = result.errors.length ? 1 : 0;
}
