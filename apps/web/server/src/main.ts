import { spawn, type ChildProcess } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { createGatewayApp } from './gateway.js';
import { createSocialImageRuntime } from './social-images.js';

type ApiModule = {
  app?: Express;
};

type AngularModule = {
  reqHandler?: RequestHandler;
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
const angularEntryFile = resolve(serverDistFolder, '..', 'app', 'server', 'server.mjs');
const astroClientFolder = resolve(serverDistFolder, '..', 'site', 'client');
const astroEntryFile = resolve(serverDistFolder, '..', 'site', 'server', 'entry.mjs');
const workerEntryFile = resolve(serverDistFolder, '..', 'worker', 'apps', 'worker', 'src', 'main.js');

let httpServer: ReturnType<Express['listen']> | undefined;
let workerProcess: ChildProcess | undefined;
let shuttingDown = false;

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

const loadAngularRequestHandler = async () => {
  const angularModule = (await import(pathToFileURL(angularEntryFile).href)) as AngularModule;

  if (typeof angularModule.reqHandler !== 'function') {
    throw new Error(`Could not load the Angular request handler from '${angularEntryFile}'.`);
  }

  return angularModule.reqHandler;
};

const startWorker = () => {
  if (process.env['DISABLE_WORKER'] === 'true') {
    console.warn('[ worker ] disabled for local composition tests');
    return;
  }

  workerProcess = spawn(process.execPath, [workerEntryFile], {
    env: process.env,
    stdio: 'inherit',
  });

  workerProcess.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`[ worker ] exited with ${signal ? `signal ${signal}` : `code ${code ?? 0}`}`);
      process.exit(code ?? 1);
    }
  });
};

const bootstrap = async () => {
  normalizeRuntimeEnv();

  const [apiApp, angularRequestHandler, astroRequestHandler] = await Promise.all([
    loadApiApp(),
    loadAngularRequestHandler(),
    loadAstroRequestHandler(),
  ]);
  let socialImageRuntime: ReturnType<typeof createSocialImageRuntime> | null = null;

  try {
    socialImageRuntime = createSocialImageRuntime();
  } catch (error: unknown) {
    console.warn('[ social-images ] runtime disabled', error);
  }

  const app = createGatewayApp({
    apiHandler: apiApp,
    angularHandler: angularRequestHandler,
    astroClientFolder,
    astroRequestHandler,
    socialImagesHandler: socialImageRuntime?.router,
  });

  startWorker();
  httpServer = app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[ server ] shutting down after ${signal}`);

    shuttingDown = true;
    workerProcess?.kill('SIGTERM');

    if (socialImageRuntime) {
      await socialImageRuntime.close();
    }

    if (httpServer) {
      httpServer.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
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
