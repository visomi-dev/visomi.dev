// @ts-check

import { serve } from 'bun';
import { Hono } from 'hono';

// @ts-expect-error
import { app as serverEnUS } from './server/en-US/server.mjs';
// @ts-expect-error
import { app as serverEsMX } from './server/es-MX/server.mjs';

function run() {
  const port = import.meta.env.PORT ? parseInt(import.meta.env.PORT, 10) : 8080;

  const server = new Hono();

  server.route('/en-US', serverEnUS());
  server.route('/es-MX', serverEsMX());

  server.get('/:resume{(resume|cv)}', (context) => {
    const resume = context.req.param('resume');

    if (resume === 'cv') {
      return context.redirect('/es-MX/cv');
    }

    return context.redirect('/en-US/resume');
  });

  server.get('/', (context) => {
    const languages = context.req.header('accept-language')?.split(',') ?? [];

    if (languages.includes('en-US')) {
      return context.redirect('/en-US/');
    }

    if (languages.includes('es-MX') || languages.includes('es-419')) {
      return context.redirect('/es-MX/');
    }

    return context.redirect('/en-US/');
  });

  serve({
    port,
    fetch: server.fetch,
  });

  console.log(`Server is running on http://localhost:${port.toString()} 🚀`);
}

run();
