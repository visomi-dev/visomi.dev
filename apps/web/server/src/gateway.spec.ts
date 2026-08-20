import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import express from 'express';
import type { Request, Response } from 'express';
import request from 'supertest';

import { createGatewayApp } from './gateway';

describe('createGatewayApp', () => {
  it('composes health, API, Angular, and public site runtimes', async () => {
    const api = express().get('/', (_req, res) => res.send({ runtime: 'api' }));
    const angular = (_req: Request, res: Response) => res.send('<app-root />');
    const astro = (_req: Request, res: Response) => {
      res.send('<html><body>site</body></html>');
    };

    const app = createGatewayApp({
      apiHandler: api,
      angularHandler: angular,
      astroClientFolder: '/tmp/visomi-dev-missing-assets',
      astroRequestHandler: astro,
    });

    await expect(request(app).get('/healthz')).resolves.toMatchObject({ status: 200, body: { status: 'ok' } });
    await expect(request(app).get('/api/')).resolves.toMatchObject({ status: 200, body: { runtime: 'api' } });
    await expect(request(app).get('/app/')).resolves.toMatchObject({ status: 200, text: '<app-root />' });
    await expect(request(app).get('/en/')).resolves.toMatchObject({
      status: 200,
      text: '<html><body>site</body></html>',
    });
  });

  describe('cache headers for prerendered assets', () => {
    let folder: string;

    beforeAll(() => {
      folder = mkdtempSync(join(tmpdir(), 'visomi-gateway-'));
      writeFileSync(join(folder, 'index.html'), '<!doctype html><p>home</p>');
      writeFileSync(join(folder, 'asset.js'), 'console.log("asset");');
    });

    afterAll(() => {
      rmSync(folder, { recursive: true, force: true });
    });

    it('serves prerendered HTML with short max-age + s-maxage + ETag', async () => {
      const astro = (_req: Request, res: Response) => {
        res.status(404).end();
      };

      const app = createGatewayApp({
        apiHandler: express().get(/(.*)/, (_q, r) => r.send({})),
        angularHandler: (_q, r) => r.send(''),
        astroClientFolder: folder,
        astroRequestHandler: astro,
      });

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toContain('max-age=300');
      expect(response.headers['cache-control']).toContain('s-maxage=3600');
      expect(response.headers['cache-control']).toContain('stale-while-revalidate');
      expect(response.headers['etag']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('honours the ETag with 304 Not Modified', async () => {
      const astro = (_req: Request, res: Response) => {
        res.status(404).end();
      };

      const app = createGatewayApp({
        apiHandler: express().get(/(.*)/, (_q, r) => r.send({})),
        angularHandler: (_q, r) => r.send(''),
        astroClientFolder: folder,
        astroRequestHandler: astro,
      });

      const first = await request(app).get('/');
      const etag = first.headers['etag'];

      const second = await request(app)
        .get('/')
        .set('If-None-Match', etag ?? '');

      expect(second.status).toBe(304);
    });

    it('falls back to the astro middleware for non-prerendered routes', async () => {
      const astro = jest.fn((_req: Request, res: Response) => {
        res.send('<html>ssr</html>');
      });

      const app = createGatewayApp({
        apiHandler: express().get(/(.*)/, (_q, r) => r.send({})),
        angularHandler: (_q, r) => r.send(''),
        astroClientFolder: folder,
        astroRequestHandler: astro as never,
      });

      const response = await request(app).get('/contact/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('<html>ssr</html>');
      expect(astro).toHaveBeenCalled();
    });
  });
});
