import { fileURLToPath } from 'node:url';
import { basename, dirname, join, resolve } from 'node:path';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { LOCALE_ID } from '@angular/core';
import { Handler, Hono } from 'hono';
import { serveStatic } from 'hono/bun';

import bootstrap from './src/main.server';

export function app(): Hono {
  const server = new Hono();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));

  const lang = basename(serverDistFolder);

  const commonEngine = new CommonEngine();

  const handler: Handler = async (context) => {
    const url = context.req.url;

    try {
      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: join(serverDistFolder, 'index.server.html'),
        url,
        publicPath: resolve(serverDistFolder, `../../browser/${lang}`),
        providers: [
          { provide: APP_BASE_HREF, useValue: `/${lang}` },
          { provide: LOCALE_ID, useValue: lang },
        ],
      });

      return context.html(html);
    } catch (error) {
      console.error(error);

      return context.html('Internal Server Error', 500);
    }
  };

  const serve = serveStatic({
    root: resolve(serverDistFolder, `../../browser`),
    onFound: (_path, context) => {
      context.header('Cache-Control', `public, immutable, max-age=31536000`);
    },
    onNotFound: (path, context) => {
      console.warn(`${path} is not found, request to ${context.req.path}`);
    },
  });

  server.get('*', (context, ...args) => {
    const fileName = context.req.url.split('/').pop();

    if (fileName && fileName.includes('.')) {
      return serve(context, ...args);
    }

    return handler(context, ...args);
  });

  return server;
}
