import express, { type Request, type Response, type NextFunction } from 'express';
import type { Pool } from 'pg';

import { otlpReceiver } from '@visomi-stack/web-backend-shared/lib/observability/lib/otlp';
import { currentObservability } from '@visomi-stack/web-backend-shared/lib/observability/lib/observability';
import {
  createPrivateMetrics,
  type PrivateMetrics,
} from '@visomi-stack/web-backend-shared/lib/observability/lib/private-metrics';
import { HttpError } from '@visomi-stack/web-backend-shared/lib/http/http-error';
import { httpErrorHandler } from '@visomi-stack/web-backend-shared/lib/http/http-error-handler';
import { httpObservability } from '@visomi-stack/web-backend-shared/lib/observability/middleware/http';
import { routes } from '@visomi-stack/web-backend-shared/lib/http/contracts';
import { securityHeaders } from '@visomi-stack/web-backend-shared/lib/http/security-headers';
import type { VisitAnalytics } from '@visomi-stack/web-backend-shared/lib/analytics/visits';
import type { Observability } from '@visomi-stack/web-backend-shared/lib/observability/lib/observability';

import { authErrorHandler, createAuthRouter } from './auth/router';
import { createContactRouter } from './contact/router';
import { createContactRepository, type ContactRepository } from './contact/repository';
import { requireOwner, type OwnerConfig } from './contact/owner';
import type { AuthRuntime } from './auth/runtime';
import { createOpenApiDocument, documentationContract, homeContract } from './openapi';

export { createAuthentication } from './auth/runtime';
export { anonymous } from './auth/shared/authorization';
export type { AuthorizationContext, AuthorizationPolicy, AuthorizationRequirement } from './auth/shared/authorization';
export { authConfig } from './auth/shared/config';

export type AppOptions = {
  observability?: Observability;
  privateMetrics?: PrivateMetrics;
  visits?: Pick<VisitAnalytics, 'summary'>;
  pool?: Pool;
  contact?: ContactRepository;
  owner?: OwnerConfig;
  auth?: AuthRuntime;
  authMode?: 'managed' | 'inherited';
  errorMode?: 'managed' | 'inherited';
  helmetMode?: 'managed' | 'inherited';
  trustProxy?: string[] | 1;
  basePath?: string;
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const document = createOpenApiDocument(options.basePath);
  const observability = options.observability ?? currentObservability();
  const privateMetrics =
    options.privateMetrics ??
    createPrivateMetrics({
      scope: 'web-api',
      enabled: process.env['VISOMI_PRIVATE_METRICS'] === 'true',
      traceExportEnabled: Boolean(otlpReceiver(process.env)),
    });

  app.disable('x-powered-by');
  app.use(privateMetrics.middleware);

  if (options.trustProxy) {
    app.set('trust proxy', options.trustProxy);
  }

  if (observability) {
    app.use(httpObservability(observability));
  }

  if ((options.helmetMode ?? 'managed') === 'managed') {
    app.use(securityHeaders());
  }

  const contact = options.contact ?? (options.pool ? createContactRepository(options.pool) : undefined);

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.get('/ready', async (_request, response) => {
    try {
      if (!contact) {
        throw new Error('not_ready');
      }

      await contact.ready();

      response.json({ status: 'ready' });
    } catch {
      response.status(503).json({ status: 'unavailable' });
    }
  });

  if (options.auth) {
    if ((options.authMode ?? 'managed') === 'managed') {
      app.use(options.auth.middleware);
    }

    app.use('/auth', createAuthRouter(options.auth), authErrorHandler);
  } else {
    app.use('/auth', (_request: Request, _response: Response, next: NextFunction) =>
      next(new HttpError(503, 'authentication_unavailable')),
    );
  }

  app.get(
    '/private/metrics',
    requireOwner(
      options.owner ?? {
        email: process.env['OWNER_EMAIL'],
        userId: process.env['OWNER_USER_ID'],
      },
    ),
    (_request, response) => response.json(privateMetrics.snapshot()),
  );

  app.get(
    '/private/visits',
    requireOwner(options.owner ?? { email: process.env['OWNER_EMAIL'], userId: process.env['OWNER_USER_ID'] }),
    async (request, response) => {
      const period = request.query['period'];

      if (period !== '7' && period !== '30') {
        response.status(400).json({ error: 'invalid_period' });

        return;
      }

      const summary = await options.visits?.summary(period === '7' ? 7 : 30);

      response.json(summary ?? { state: 'disabled' });
    },
  );

  app.use(
    '/contact',
    createContactRouter(
      contact,
      options.owner ?? { email: process.env['OWNER_EMAIL'], userId: process.env['OWNER_USER_ID'] },
    ),
  );
  routes.register(app, [
    { contract: documentationContract, handler: (_request, response) => response.json(document) },
    { contract: homeContract, handler: (_request, response) => response.json({ message: 'Hello API' }) },
  ]);
  app.use((_request, response) => {
    response.status(404).json({ error: 'not_found' });
  });

  if ((options.errorMode ?? 'managed') === 'managed') {
    app.use(httpErrorHandler);
  }

  return app;
}
