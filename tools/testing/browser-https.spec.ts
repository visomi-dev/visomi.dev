import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { browserHttps } from './browser-https';

test('a failed TLS bind releases the already-acquired forward proxy port', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'visomi-proxy-cleanup-'));
  const occupied = createServer();
  const probe = createServer();

  try {
    occupied.listen(0, '127.0.0.1');

    await once(occupied, 'listening');

    const address = occupied.address();

    assert.ok(address && typeof address === 'object');
    const port = address.port;

    // Verify the forward port is available before reproducing the later TLS failure.
    probe.listen(port + 200, '127.0.0.1');

    await once(probe, 'listening');

    await new Promise<void>((done) => probe.close(() => done()));

    await assert.rejects(browserHttps(directory, port, 1), { code: 'EADDRINUSE' });

    probe.listen(port + 200, '127.0.0.1');

    await once(probe, 'listening');
  } finally {
    await Promise.all([
      new Promise<void>((done) => occupied.close(() => done())),
      new Promise<void>((done) => probe.close(() => done())),
    ]);

    await rm(directory, { recursive: true, force: true });
  }
});
