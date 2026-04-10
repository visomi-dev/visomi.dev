import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import { createSocialImageRuntime } from './social-images.js';

type ApiModule = {
  app?: Express;
};

type AstroMiddlewareModule = {
  handler?: (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
};

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const normalizeRuntimeEnv = () => {
  const remoteUrl = process.env['ASTRO_DB_REMOTE_URL'];

  if (!remoteUrl) {
    console.warn('[ astro-db ] ASTRO_DB_REMOTE_URL is not set');
    return;
  }

  const normalizedRemoteUrl = remoteUrl.trim().replace(/^"|"$/g, '');

  if (normalizedRemoteUrl !== remoteUrl) {
    process.env['ASTRO_DB_REMOTE_URL'] = normalizedRemoteUrl;
  }

  try {
    const parsedUrl = new URL(normalizedRemoteUrl);
    console.log(`[ astro-db ] using remote ${parsedUrl.protocol}//${parsedUrl.host}`);
  } catch {
    console.error('[ astro-db ] invalid ASTRO_DB_REMOTE_URL value at runtime');
  }
};

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const apiEntryFile = resolve(serverDistFolder, '..', 'api', 'main.js');
const astroClientFolder = resolve(serverDistFolder, '..', 'website', 'client');
const astroEntryFile = resolve(serverDistFolder, '..', 'website', 'server', 'entry.mjs');

const loadApiApp = async () => {
  const apiModule = (await import(pathToFileURL(apiEntryFile).href)) as ApiModule;

  if (!apiModule.app) {
    throw new Error(`Could not load the API app from '${apiEntryFile}'.`);
  }

  return apiModule.app;
};

const loadAstroRequestHandler = async () => {
  const astroModule = (await import(pathToFileURL(astroEntryFile).href)) as AstroMiddlewareModule;

  if (typeof astroModule.handler !== 'function') {
    throw new TypeError(`Could not load the Astro request handler from '${astroEntryFile}'.`);
  }

  return astroModule.handler;
};

const bootstrap = async () => {
  normalizeRuntimeEnv();

  const [apiApp, astroRequestHandler] = await Promise.all([loadApiApp(), loadAstroRequestHandler()]);
  const app = express();
  let socialImageRuntime: ReturnType<typeof createSocialImageRuntime> | null = null;

  try {
    socialImageRuntime = createSocialImageRuntime();
  } catch (error: unknown) {
    console.warn('[ social-images ] runtime disabled', error);
  }

  app.use(express.json());

  if (socialImageRuntime) {
    app.use('/api/internal/social-images', socialImageRuntime.router);
    app.use('/images/seo', socialImageRuntime.staticMiddleware);
  }

  app.use('/api', apiApp);
  app.use(
    express.static(astroClientFolder, {
      index: false,
      maxAge: '1y',
      redirect: false,
    }),
  );
  app.use((req, res, next) => astroRequestHandler(req, res, next));

  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[ server ] shutting down after ${signal}`);

    if (socialImageRuntime) {
      await socialImageRuntime.close();
    }

    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

bootstrap().catch((error: unknown) => {
  console.error('[ error ] Failed to bootstrap gateway server', error);
  process.exit(1);
});
