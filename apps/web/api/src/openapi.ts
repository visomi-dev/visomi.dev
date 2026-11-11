import { createApiDocument, defineRoute } from '@visomi-stack/web-backend-shared/lib/http/contracts';
import { z } from 'zod';

import { contactContracts } from './contact/contracts';
import { passwordContracts } from './auth/password/contract';
import { sessionsContracts } from './auth/sessions/contract';

export const homeContract = defineRoute({
  method: 'get',
  path: '/',
  operationId: 'api_home',
  summary: 'API availability',
  tags: ['api'],
  security: [],
  request: z.object({}),
  responses: {
    200: {
      description: 'API is available.',
      content: { 'application/json': { schema: z.object({ message: z.literal('Hello API') }) } },
    },
  },
});
export const documentationContract = defineRoute({
  method: 'get',
  path: '/openapi.json',
  operationId: 'api_openapi',
  summary: 'OpenAPI document',
  tags: ['api'],
  security: [],
  request: z.object({}),
  responses: {
    200: {
      description: 'OpenAPI 3.1 document assembled without authentication resources.',
      content: {
        'application/json': {
          schema: z.looseObject({
            openapi: z.literal('3.1.0'),
            info: z.object({ title: z.string(), version: z.string() }),
            paths: z.record(z.string(), z.unknown()),
          }),
        },
      },
    },
  },
});

export const authContracts = [
  passwordContracts.signIn,
  passwordContracts.verifySignIn,
  sessionsContracts.getSession,
  sessionsContracts.logout,
].map((contract) => ({ ...contract, path: `/auth${contract.path}` }));

export function createOpenApiDocument(basePath = '/') {
  return createApiDocument({
    title: 'visomi.dev API',
    version: '0.1.0',
    basePath,
    contracts: [homeContract, documentationContract, ...authContracts, ...contactContracts],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: '__Host-visomi.sid',
          description:
            'Secure host-only production session. A session may be anonymous, unverified or restricted; documented authorization rules still apply.',
        },
        localSessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'visomi.sid',
          description: 'Loopback HTTP development session.',
        },
        csrf: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description:
            'Token from GET /auth/session, bound to the browser session. The configured Origin is also required.',
        },
      },
    },
  });
}
