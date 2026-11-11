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
});
