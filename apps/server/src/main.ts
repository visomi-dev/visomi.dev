import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import express, { type Express, type NextFunction, type Request, type Response } from 'express';

type ApiModule = {
  app?: Express;
};

type WebsiteSsrModule = {
  reqHandler?: (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
};

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const apiEntryFile = resolve(serverDistFolder, '..', 'api', 'main.js');
const websiteEntryFile = resolve(serverDistFolder, '..', 'ng-website', 'server', 'server.mjs');

const loadApiApp = async () => {
  const apiModule = (await import(pathToFileURL(apiEntryFile).href)) as ApiModule;

  if (!apiModule.app) {
    throw new Error(`Could not load the API app from '${apiEntryFile}'.`);
  }

  return apiModule.app;
};

const loadWebsiteRequestHandler = async () => {
  const websiteSsrModule = (await import(pathToFileURL(websiteEntryFile).href)) as WebsiteSsrModule;

  if (typeof websiteSsrModule.reqHandler !== 'function') {
    throw new TypeError(`Could not load the Angular SSR request handler from '${websiteEntryFile}'.`);
  }

  return websiteSsrModule.reqHandler;
};

const bootstrap = async () => {
  const [apiApp, websiteRequestHandler] = await Promise.all([loadApiApp(), loadWebsiteRequestHandler()]);
  const app = express();

  app.use('/api', apiApp);
  app.use((req, res, next) => websiteRequestHandler(req, res, next));

  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
};

bootstrap().catch((error: unknown) => {
  console.error('[ error ] Failed to bootstrap gateway server', error);
  process.exit(1);
});
