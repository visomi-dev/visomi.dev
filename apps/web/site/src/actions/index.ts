import { createHmac } from 'node:crypto';

import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      email: z.email().max(254),
      locale: z.enum(['en', 'es']),
      message: z.string().min(10).max(5000),
      name: z.string().min(2).max(120),
      type: z.enum(['consulting', 'speaking', 'fulltime', 'other']),
    }),
    handler: async (input, context) => {
      try {
        const endpoint = new URL(process.env['CONTACT_API_URL'] ?? 'http://127.0.0.1:8080/api/contact/submissions');

        if (!['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)) {
          throw new Error('contact_endpoint_invalid');
        }

        const secret = process.env['CONTACT_PROXY_SECRET'];
        const client = createHmac('sha256', secret ?? 'unconfigured')
          .update(context.clientAddress)
          .digest('hex');
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(secret
              ? {
                  'x-contact-client': client,
                  'x-contact-signature': createHmac('sha256', secret).update(client).digest('hex'),
                }
              : {}),
          },
          body: JSON.stringify(input),
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          throw new Error('contact_unavailable');
        }

        return { message: input.locale === 'es' ? 'Mensaje enviado correctamente.' : 'Message sent successfully.' };
      } catch {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: input.locale === 'es' ? 'No se pudo guardar el mensaje.' : 'Could not store the message.',
        });
      }
    },
  }),
};
