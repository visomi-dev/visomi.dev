import { once } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import express from 'express';

import { redirectTrailingSlash, websiteAssets } from './website';

it('preserves prerendered content, conditional caching, HEAD, MIME and safe route fallthrough', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'visomi.website.'));

  await mkdir(join(folder, 'journey'));

  await writeFile(join(folder, 'index.html'), '<h1>Public home</h1>');

  await writeFile(join(folder, 'journey/index.html'), '<h1>Public journey</h1>');

  await writeFile(join(folder, 'asset.css'), 'body{color:blue}');

  await writeFile(join(folder, 'asset.unknown'), 'opaque');

  await mkdir(join(folder, 'directory.txt'));

  const app = express();

  app.use(websiteAssets(folder));
  app.use((_request, response) => response.status(404).end());
  const server = app.listen(0, '127.0.0.1');

  await once(server, 'listening');

  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    const home = await fetch(origin);
    const awaitedResult1 = await home.text();

    expect(awaitedResult1).toContain('Public home');
    expect(home.headers.get('cache-control')).toContain('s-maxage=3600');
    expect(home.headers.get('content-security-policy')).toContain("script-src 'self'");
    const cached = await fetch(origin, { headers: { 'if-none-match': home.headers.get('etag')! } });

    expect(cached.status).toBe(304);
    const head = await fetch(origin + '/journey/', { method: 'HEAD' });

    expect(head.status).toBe(200);
    const awaitedResult2 = await head.text();

    expect(awaitedResult2).toBe('');
    for (const [path, type] of [
      ['asset.css', 'text/css'],
      ['asset.unknown', 'application/octet-stream'],
    ]) {
      const asset = await fetch(origin + '/' + path);

      expect(asset.headers.get('content-type')).toContain(type);
      expect(asset.headers.get('cache-control')).toContain('immutable');

      await asset.arrayBuffer();
    }
    for (const [path, method] of [
      ['missing.txt', 'GET'],
      ['directory.txt', 'GET'],
      ['', 'POST'],
    ]) {
      const missing = await fetch(origin + '/' + path, { method });

      expect(missing.status).toBe(404);
    }
    const escaped = await new Promise<number>((done, reject) => {
      const request = httpRequest(origin, { path: '/../escape.txt' }, (response) => {
        response.resume();
        done(response.statusCode!);
      });

      request.on('error', reject);
      request.end();
    });

    expect(escaped).toBe(400);
    const trailing = express();

    trailing.use(websiteAssets(folder + '/'));
    const other = trailing.listen(0, '127.0.0.1');

    await once(other, 'listening');

    try {
      const response = await fetch(`http://127.0.0.1:${(other.address() as AddressInfo).port}/`);

      expect(response.status).toBe(200);

      await response.arrayBuffer();
    } finally {
      other.closeAllConnections();

      await new Promise<void>((done) => other.close(() => done()));
    }
  } finally {
    server.closeAllConnections();

    await new Promise<void>((done) => server.close(() => done()));

    await rm(folder, { recursive: true, force: true });
  }
});

it.each([
  ['/', 'GET', undefined],
  ['/_astro/file', 'GET', undefined],
  ['/journey', 'GET', '/journey/'],
  ['/journey', 'HEAD', '/journey/'],
  ['/journey//', 'GET', '/journey/'],
  ['/journey//', 'POST', '/journey/'],
  ['/asset.css', 'GET', undefined],
  ['/journey/', 'GET', undefined],
])('canonicalizes only public extensionless URLs: %s %s', (path, method, location) => {
  const response = { status: vi.fn().mockReturnThis(), location: vi.fn().mockReturnThis(), end: vi.fn() };
  const next = vi.fn();

  redirectTrailingSlash(
    { path, url: path + '?public=1', method } as Parameters<typeof redirectTrailingSlash>[0],
    response as unknown as Parameters<typeof redirectTrailingSlash>[1],
    next,
  );

  if (location) {
    expect(response.location).toHaveBeenCalledWith(location + '?public=1');
    expect(response.status).toHaveBeenCalledWith(method === 'GET' ? 301 : 308);
  } else {
    expect(next).toHaveBeenCalledOnce();
  }
});
