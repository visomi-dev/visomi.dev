import { fileURLToPath } from 'node:url';
import { basename, dirname, join, resolve } from 'node:path';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { LOCALE_ID } from '@angular/core';
import { Handler, Hono } from 'hono';

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

  server.get('/:home{index.html}?', handler);
  server.get('/:path{(?!.*\\..*).+$}', handler);

  return server;
}
