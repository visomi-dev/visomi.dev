import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { SourceMap } from 'node:module';
import { join } from 'node:path';

import { resolveBrowserError } from './resolve-browser-error.mjs';

for (const directory of ['dist/apps/web/site/client', 'dist/apps/web/app/browser']) {
  const files = await readdir(directory, { recursive: true });
  const mapFile = files.find((path) => path.endsWith('.js.map'));

  assert.ok(mapFile, 'Every browser application must retain private build maps');
  const assetFile = join(directory, mapFile.slice(0, -4));
  const contents = await readFile(assetFile);
  const source = await readFile(assetFile + '.map', 'utf8');

  assert.ok(!contents.toString().includes('sourceMappingURL='), 'Private maps must not be linked from browser bundles');
  const map = new SourceMap(JSON.parse(source));
  let position;

  for (let line = 0; line < 5 && !position; line++) {
    for (let column = 0; column < 10000; column += 10) {
      const entry = map.findEntry(line, column);

      if (typeof entry.originalSource === 'string') {
        position = { line: line + 1, column: column + 1 };
        break;
      }
    }
  }
  assert.ok(position, 'An actual emitted mapping must be resolvable');
  const fingerprint = createHash('sha256').update(contents).digest('hex');
  const resolved = await resolveBrowserError(directory, fingerprint, position.line, position.column);

  assert.ok(resolved?.source && resolved.line > 0 && resolved.column > 0);
}
process.stdout.write('private_browser_artifact_maps_verified\n');
