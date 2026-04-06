/* eslint-disable import-x/no-unresolved */
import { ActionError, defineAction } from 'astro:actions';
import { ContactSubmission, db } from 'astro:db';
import { z } from 'astro/zod';

const contactTypeSchema = z.enum(['consulting', 'speaking', 'fulltime', 'other']);
const localeSchema = z.enum(['en', 'es']);

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      email: z.email(),
      locale: localeSchema,
      message: z.string().min(10).max(5000),
      name: z.string().min(2).max(120),
      type: contactTypeSchema,
    }),
    handler: async (input) => {
      try {
        await db.insert(ContactSubmission).values({
          email: input.email,
          locale: input.locale,
          message: input.message,
          name: input.name,
          type: input.type,
        });

        return {
          message: input.locale === 'es' ? 'Mensaje enviado correctamente.' : 'Message sent successfully.',
        };
      } catch (_error) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: input.locale === 'es' ? 'No se pudo guardar el mensaje.' : 'Could not store the message.',
        });
      }
    },
  }),
};
