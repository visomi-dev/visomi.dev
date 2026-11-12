import { createHmac, timingSafeEqual } from 'node:crypto';

import { Router, json, type Request, type ErrorRequestHandler } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { z } from 'zod';

import { requireOwner, type OwnerConfig } from './owner';
import { contactLimits } from './limits';
import type { ContactRepository } from './repository';

// PostgreSQL text requires valid Unicode scalars and excludes NUL; preserve content without replacement.
const unicodeText = z.string().refine(
  (value) =>
    !value.includes('\0') &&
    Array.from(value).every((character) => {
      const point = character.codePointAt(0)!;

      return point < 0xd800 || point > 0xdfff;
    }),
);

export const contactInput = z.strictObject({
  email: z.email().max(254),
  locale: z.enum(['en', 'es']),
  message: unicodeText.refine((value) => value.length >= 10 && value.length <= 5000),
  name: unicodeText.refine((value) => value.length >= 2 && value.length <= 120),
  type: z.enum(['consulting', 'speaking', 'fulltime', 'other']),
});
const identifier = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .pipe(z.string().refine((value) => BigInt(value) <= 9223372036854775807n));

function clientKey(request: Request): string {
  const source = request.get('x-contact-client');
  const signature = request.get('x-contact-signature');
  const secret = process.env['CONTACT_PROXY_SECRET'];

  if (source && signature && secret && /^[a-f0-9]{64}$/.test(signature)) {
    const expected = createHmac('sha256', secret).update(source).digest();

    if (timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
      return source;
    }
  }

  return ipKeyGenerator(request.ip ?? 'unknown');
}

export function createContactRouter(repository: ContactRepository | undefined, owner: OwnerConfig): Router {
  const router = Router();

  router.use((_request, response, next) => {
    response.set('Cache-Control', 'private, no-store').set('X-Content-Type-Options', 'nosniff');
    next();
  });
  router.post(
    '/submissions',
    rateLimit({
      windowMs: 10 * 60_000,
      store: contactLimits(10 * 60_000, 5),
      limit: 5,
      keyGenerator: clientKey,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      handler: (_request, response) => response.status(429).json({ error: 'rate_limited' }),
      // Constants and the bounded store are validated by integration tests.
      // Suppress library diagnostics that may contain transport addresses.
      validate: false,
    }),
    json({ limit: '16kb' }),
    async (request, response) => {
      const input = contactInput.safeParse(request.body);

      if (!input.success) {
        response.status(422).json({ error: 'input_invalid' });

        return;
      }

      try {
        if (!repository) {
          throw new Error('contact_unavailable');
        }

        await repository.submit(input.data);

        response.status(201).json({ sent: true });
      } catch {
        response.status(503).json({ error: 'contact_unavailable' });
      }
    },
  );
  router.use(requireOwner(owner));
  router.get('/session', (_request, response) => response.json({ owner: true }));
  router.get('/submissions', async (request, response) => {
    const query = z
      .strictObject({ before: identifier.optional(), limit: z.coerce.number().int().min(1).max(100).default(25) })
      .safeParse(request.query);

    if (!query.success) {
      response.status(400).json({ error: 'query_invalid' });

      return;
    }

    try {
      if (!repository) {
        throw new Error('contact_unavailable');
      }

      const rows = await repository.list(query.data.before, query.data.limit + 1);
      const items = rows.slice(0, query.data.limit).map(({ message: _message, ...item }) => item);

      response.json({ items, next: rows.length > query.data.limit ? items.at(-1)!.id : null });
    } catch {
      response.status(503).json({ error: 'contact_unavailable' });
    }
  });
  router.get('/submissions/:id', async (request, response) => {
    const id = identifier.safeParse(request.params['id']);

    if (!id.success) {
      response.status(400).json({ error: 'id_invalid' });

      return;
    }

    try {
      if (!repository) {
        throw new Error('contact_unavailable');
      }

      const item = await repository.detail(id.data);

      response.status(item ? 200 : 404).json(item ? { item } : { error: 'not_found' });
    } catch {
      response.status(503).json({ error: 'contact_unavailable' });
    }
  });

  const inputErrors: ErrorRequestHandler = (error: unknown, _request, response, next) => {
    // Express dispatches only truthy errors here; primitives safely yield an absent type.
    const kind = (error as { type?: unknown }).type;

    if (kind === 'entity.too.large' || kind === 'entity.parse.failed') {
      response.status(kind === 'entity.too.large' ? 413 : 400).json({ error: 'input_invalid' });

      return;
    }

    next(error);
  };

  router.use(inputErrors);

  return router;
}
