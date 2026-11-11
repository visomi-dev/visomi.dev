import { z } from 'zod';

export const socialImageRunId = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/);
export const socialImageTarget = z.strictObject({
  locale: z.enum(['en', 'es']),
  page: z.enum(['home', 'journey', 'projects', 'resume', 'contact']),
});
export const socialImagePageInput = z.strictObject({ runId: socialImageRunId.optional(), target: socialImageTarget });
export const socialImageWebsiteInput = z.strictObject({
  runId: socialImageRunId.optional(),
  targets: z.array(socialImageTarget).min(1).max(10).optional(),
});
