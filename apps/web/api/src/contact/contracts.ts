import { z } from 'zod';

import { defineRoute } from '@visomi-stack/web-backend-shared/lib/http/contracts';

import { commonErrors, cookieSecurity } from '../auth/shared/contracts';

import { contactInput } from './router';

const item = contactInput.extend({ id: z.string(), createdAt: z.iso.datetime() });
const description =
  'Requires the configured verified owner. Responses are private and no-store; authentication alone does not grant access.';

export const contactContracts = [
  defineRoute({
    method: 'post',
    path: '/contact/submissions',
    operationId: 'contact_submit',
    summary: 'Send a contact request',
    tags: ['contact'],
    security: [],
    request: z.object({ body: contactInput }),
    responses: {
      ...commonErrors,
      201: {
        description: 'Request stored.',
        content: { 'application/json': { schema: z.object({ sent: z.literal(true) }) } },
      },
      422: { description: 'Invalid input.' },
      413: { description: 'Input too large.' },
    },
  }),
  defineRoute({
    method: 'get',
    path: '/contact/session',
    operationId: 'contact_owner',
    summary: 'Check owner access',
    tags: ['contact'],
    description,
    security: cookieSecurity,
    request: z.object({}),
    responses: {
      ...commonErrors,
      200: {
        description: 'Owner authorized.',
        content: { 'application/json': { schema: z.object({ owner: z.literal(true) }) } },
      },
    },
  }),
  defineRoute({
    method: 'get',
    path: '/contact/submissions',
    operationId: 'contact_list',
    summary: 'List contact requests',
    tags: ['contact'],
    description,
    security: cookieSecurity,
    request: z.object({
      query: z.object({ before: z.string().optional(), limit: z.coerce.number().int().min(1).max(100).optional() }),
    }),
    responses: {
      ...commonErrors,
      200: {
        description: 'Page of requests without message content.',
        content: {
          'application/json': {
            schema: z.object({ items: z.array(item.omit({ message: true })), next: z.string().nullable() }),
          },
        },
      },
    },
  }),
  defineRoute({
    method: 'get',
    path: '/contact/submissions/:id',
    operationId: 'contact_detail',
    summary: 'Read a contact request',
    tags: ['contact'],
    description,
    security: cookieSecurity,
    request: z.object({ params: z.object({ id: z.string() }) }),
    responses: {
      ...commonErrors,
      200: {
        description: 'Request details, rendered as escaped text by the dashboard.',
        content: { 'application/json': { schema: z.object({ item }) } },
      },
      404: { description: 'Request not found.' },
    },
  }),
];
