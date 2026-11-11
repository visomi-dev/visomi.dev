import { Router, json } from 'express';
import { HttpError } from '@visomi-stack/web-backend-shared/lib/http/http-error';
import { validateRequest } from '@visomi-stack/web-backend-shared/lib/http/contracts';

import { isOwner } from '../contact/owner';

import { passwordContracts } from './password/contract';
import type { AuthRuntime } from './runtime';
import { csrf, rateLimit } from './shared/security';

export { authErrorHandler } from './shared/http';

export function createAuthRouter(auth: AuthRuntime): Router {
  const router = Router();

  router.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });
  router.use((request, response, next) => {
    const allowed = new Set(['GET /session', 'POST /logout', 'POST /password/sign-in', 'POST /password/verify']);

    if (!allowed.has(`${request.method} ${request.path}`)) {
      response.status(404).json({ error: 'not_found' });

      return;
    }

    if (!process.env['OWNER_EMAIL']) {
      response.status(503).json({ error: 'owner_access_unavailable' });

      return;
    }

    next();
  });
  router.use(auth.requireInitialized);
  router.use(rateLimit(auth.requestLimits, auth.config));
  router.use(csrf(auth.config));
  router.use(json({ limit: '32kb' }));
  router.get('/session', auth.controllers.sessions.getSession.bind(auth.controllers.sessions));
  router.post('/logout', auth.controllers.sessions.logout.bind(auth.controllers.sessions));
  router.post(
    '/password/sign-in',
    validateRequest(
      passwordContracts.signIn.request,
      async (request, response, input) => {
        if (input.body.email.toLowerCase() !== process.env['OWNER_EMAIL']!.toLowerCase()) {
          throw new HttpError(403, 'access_denied');
        }

        await auth.controllers.password.signIn(request, response, input);
      },
      passwordContracts.signIn.validationErrors,
    ),
  );
  router.post(
    '/password/verify',
    validateRequest(
      passwordContracts.verifySignIn.request,
      async (request, response, input) => {
        const user = await auth.password.loginComplete(request.sessionID, input.body.flowId, input.body.factor);

        if (!isOwner(user, { email: process.env['OWNER_EMAIL'], userId: process.env['OWNER_USER_ID'] })) {
          throw new HttpError(403, 'access_denied');
        }

        await auth.responses.send(request, response, user);
      },
      passwordContracts.verifySignIn.validationErrors,
    ),
  );

  return router;
}
