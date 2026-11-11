import type { NextFunction, Request, Response } from 'express';
import { Router, json } from 'express';

import { createDeviceRouter } from '../../../src/auth/devices/router';
import { createEmailRouter } from '../../../src/auth/email/router';
import { createGoogleRouter } from '../../../src/auth/google/router';
import { createMethodRouter } from '../../../src/auth/methods/router';
import { createPasskeyRouter } from '../../../src/auth/passkeys/router';
import { createPasswordRouter } from '../../../src/auth/password/router';
import { createRecoveryRouter } from '../../../src/auth/recovery/router';
import type { AuthRuntime } from '../../../src/auth/runtime';
import { createSessionRouter } from '../../../src/auth/sessions/router';
import { csrf, rateLimit } from '../../../src/auth/shared/security';
import { createTotpRouter } from '../../../src/auth/totp/router';

export { authErrorHandler, saveSession } from '../../../src/auth/shared/http';

export function createAuthRouter(auth: AuthRuntime): Router {
  const router = Router();

  router.use(disableCaching);
  router.use(auth.requireInitialized);
  router.use(rateLimit(auth.requestLimits, auth.config));
  router.use(csrf(auth.config));
  router.use(json({ limit: '32kb' }));
  router.use(createPasswordRouter(auth.controllers.password, auth.authenticated));
  router.use(createEmailRouter(auth.controllers.email, auth.authenticated));
  router.use(createGoogleRouter(auth.controllers.google, auth.authenticated));
  router.use(createTotpRouter(auth.controllers.totp, auth.authenticated));
  router.use(createRecoveryRouter(auth.controllers.recovery));
  router.use(createDeviceRouter(auth.controllers.devices, auth.authenticated));
  router.use(createMethodRouter(auth.controllers.methods, auth.authenticated));
  router.use(createSessionRouter(auth.controllers.sessions, auth.authenticated));
  router.use(createPasskeyRouter(auth.controllers.passkeys, auth.authenticated));

  return router;
}

function disableCaching(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader('Cache-Control', 'no-store');
  next();
}
