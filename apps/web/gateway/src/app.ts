import { HttpError } from '@visomi-stack/web-backend-shared/lib/http/http-error';
import type { createBrowserTelemetry } from '@visomi-stack/web-backend-shared/lib/observability/browser/intake';
import { httpObservability } from '@visomi-stack/web-backend-shared/lib/observability/middleware/http';
import { securityHeaders } from '@visomi-stack/web-backend-shared/lib/http/security-headers';
import type { Observability } from '@visomi-stack/web-backend-shared/lib/observability/lib/observability';
import type { Pool } from 'pg';
import express, {
  Router,
  static as serveStatic,
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from 'express';

import type { ApiModule, EmbeddedAuthentication } from './api-module';
import type { SiteModule } from './site-module';
import type { ApplicationModule } from './application-module';
import { pageErrors } from './page-errors';
import { websiteAssets, redirectTrailingSlash } from './website';

export function createGatewayApp(options: {
  api: ApiModule;
  pool?: Pool;
  socialImages?: RequestHandler;
  site?: SiteModule;
  application?: ApplicationModule;
  auth?: EmbeddedAuthentication;
  observability?: Observability;
  browserTelemetry?: Pick<ReturnType<typeof createBrowserTelemetry>, 'context' | 'router'>;
  trustProxy?: string[];
  helmetMode?: 'managed' | 'inherited';
  errorMode?: 'managed' | 'inherited';
}) {
  const app = express();
  const errors = pageErrors(options.site?.clientDirectory);

  app.disable('x-powered-by');

  if (options.trustProxy) {
    app.set('trust proxy', options.trustProxy);
  }

  if (options.observability) {
    app.use(httpObservability(options.observability));
  }

  if ((options.helmetMode ?? 'managed') === 'managed') {
    const headers = securityHeaders();
    const applicationHeaders = securityHeaders({ nonce: true, google: options.auth?.googleEnabled === true });

    app.use((request, response, next) =>
      (request.path === '/app' || request.path.startsWith('/app/') ? applicationHeaders : headers)(
        request,
        response,
        next,
      ),
    );
  }

  app.use((request, response, next) => {
    let path: string;

    try {
      path = decodeURIComponent(request.path).toLowerCase();
    } catch {
      return errors(new HttpError(400, 'request_invalid'), request, response, next);
    }

    if (path.endsWith('.map')) {
      response.status(404).json({ error: 'not_found' });

      return;
    }

    if (/\/system-errors(?:\/|$)/.test(path)) {
      return errors(new HttpError(404, 'not_found'), request, response, next);
    }

    next();
  });

  if (options.browserTelemetry) {
    app.use(options.browserTelemetry.context);
    app.use('/telemetry', options.browserTelemetry.router);
  }

  // Disabled capture must not produce a failed resource request on every page.
  app.get('/telemetry/config', (_request, response) =>
    response.set('cache-control', 'no-store').json({ enabled: false }),
  );

  if (options.socialImages) {
    app.use('/api/internal/social-images', options.socialImages);
  }

  app.get('/healthz', (_request, response) => response.json({ status: 'ok' }));

  if (options.auth) {
    // Public assets and error documents remain available during an authentication outage.
    const authentication = Router();

    authentication.use((request: Request, _response: Response, next: NextFunction) => {
      if (/^\/(?:api|app)(?:\/|$)/i.test(request.path)) {
        next();
      } else {
        next('router');
      }
    }, options.auth.middleware);
    app.use(authentication);
  }

  app.use(
    '/api',
    options.api.createApp({
      basePath: '/api',
      pool: options.pool,
      authMode: 'inherited',
      errorMode: 'inherited',
      helmetMode: 'inherited',
      auth: options.auth,
      observability: options.observability,
    }),
  );

  if (options.application) {
    const application = options.application.createApp({
      observability: options.observability,
      errorMode: 'inherited',
      helmetMode: 'inherited',
      ...(options.trustProxy ? { trustProxy: options.trustProxy } : {}),
      authContext: (request) => ({
        available: Boolean(options.auth?.snapshot),
        session: options.auth?.snapshot?.(request) ?? null,
      }),
    });

    // Preserve /app in the URL for Angular's localized assets and SSR manifest.
    app.use((request, response, next) => {
      if (request.path === '/app' || request.path.startsWith('/app/')) {
        application(request, response, next);
      } else {
        next();
      }
    });
  }

  // Public pages must never turn missing API or future application routes into site responses.
  app.use((request, response, next) => {
    if (/^\/(?:api|app)(?:\/|$)/i.test(request.path)) {
      return errors(new HttpError(404, 'not_found'), request, response, next);
    }

    next();
  });

  if (options.site) {
    app.use(websiteAssets(options.site.clientDirectory));
    app.use(serveStatic(options.site.clientDirectory, { index: false, redirect: false }));
    app.use(redirectTrailingSlash);
    app.use((request, _response, next) => {
      // Astro accepts forwarded addresses after host validation. Trust only Express's configured proxy policy.
      request.headers['x-forwarded-for'] = request.ip;
      next();
    });
    app.use(options.site.handler);
  }

  app.use((request, response, next) => errors(new HttpError(404, 'not_found'), request, response, next));

  if ((options.errorMode ?? 'managed') === 'managed') {
    app.use(errors);
  }

  return app;
}
