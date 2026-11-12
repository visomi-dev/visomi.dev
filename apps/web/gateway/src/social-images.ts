import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

import { Queue, QueueEvents } from 'bullmq';
import { Router, json, type RequestHandler, type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';

import { socialImageRedisOptions } from '@visomi.dev/shared-social-images/redis';
import {
  socialImageRunId as runId,
  socialImagePageInput as pageInput,
  socialImageWebsiteInput as websiteInput,
} from '@visomi.dev/shared-social-images/validation';
import { promoteSocialImageRun } from '@visomi.dev/shared-social-images/promotion';
import { readSocialImageManifest } from '@visomi.dev/shared-social-images/paths';
import {
  GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME,
  GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME,
  SOCIAL_IMAGE_QUEUE_NAME,
} from '@visomi.dev/shared-social-images/types';
import type {
  SocialImageBatchResult,
  GeneratePageSocialImageJob,
  GenerateWebsiteSocialImagesJob,
} from '@visomi.dev/shared-social-images/types';

export function socialImageAuthorization(secret: string | undefined): RequestHandler {
  return (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    const token = request.get('authorization')?.replace(/^Bearer /, '');
    const tokenBytes = Buffer.from(token ?? '');
    const secretBytes = Buffer.from(secret ?? '');

    if (
      !secret ||
      secret.length < 32 ||
      !token ||
      tokenBytes.length !== secretBytes.length ||
      !timingSafeEqual(tokenBytes, secretBytes)
    ) {
      response.status(403).json({ error: 'access_denied' });

      return;
    }

    next();
  };
}

// Queue initialization can wait indefinitely if Redis was offline at construction.
// Bound this read-only probe before attempting any write, so a timed-out request cannot enqueue later.
async function queueProbe<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('social_images_unavailable')), 3000);
  });

  try {
    const result = await Promise.race([work, deadline]);

    return result;
  } finally {
    clearTimeout(timer!);
  }
}

export function createSocialImageRuntime() {
  const redisUrl = process.env['REDIS_URL']?.trim();

  if (!redisUrl) {
    throw new Error('social_images_unavailable');
  }

  const connection = socialImageRedisOptions(redisUrl);
  const queue = new Queue<GeneratePageSocialImageJob | GenerateWebsiteSocialImagesJob, SocialImageBatchResult, string>(
    SOCIAL_IMAGE_QUEUE_NAME,
    {
      connection: {
        ...connection,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        commandTimeout: 3000,
        connectTimeout: 3000,
      },
    },
  );
  const events = new QueueEvents(SOCIAL_IMAGE_QUEUE_NAME, { connection });

  queue.on('error', () => {
    /* HTTP failures are mapped to a fixed code below. */
  });
  events.on('error', () => {
    /* QueueEvents reconnects without logging connection details. */
  });
  const router = Router();

  router.use(socialImageAuthorization(process.env['SOCIAL_IMAGE_INTERNAL_TOKEN']));
  router.use(
    rateLimit({
      windowMs: 60_000,
      limit: 10,
      keyGenerator: () => 'internal',
      standardHeaders: false,
      legacyHeaders: false,
    }),
  );
  router.use(json({ limit: '8kb' }));
  const enqueue = async (request: Request, response: Response, kind: 'page' | 'website') => {
    const input = (kind === 'page' ? pageInput : websiteInput).safeParse(request.body);

    if (!input.success || !['true', 'false', undefined].includes(request.query['wait'] as string | undefined)) {
      response.status(400).json({ error: 'input_invalid' });

      return;
    }

    try {
      const awaitedResult1 = await queueProbe(queue.getWaitingCount());

      if (awaitedResult1 >= 20) {
        response.status(429).json({ error: 'queue_full' });

        return;
      }

      const data = { ...input.data, runId: input.data.runId ?? randomUUID() };
      const id = createHash('sha256')
        .update(JSON.stringify([kind, data]))
        .digest('hex');
      const job = await queue.add(
        kind === 'page' ? GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME : GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME,
        data,
        {
          jobId: id,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 100 },
        },
      );

      const state = await job.getState();

      if (state === 'failed') {
        await job.retry();
      }

      if (request.query['wait'] === 'false') {
        response.status(202).json({ jobId: job.id, queued: true });

        return;
      }

      const result = await job.waitUntilFinished(events, 30_000);
      const promotion = await promoteSocialImageRun(result.runId);

      response.json({ jobId: job.id, result, promotion });
    } catch {
      response.status(503).json({ error: 'social_images_unavailable' });
    }
  };

  router.post('/page', (request, response) => enqueue(request, response, 'page'));
  router.post('/website', (request, response) => enqueue(request, response, 'website'));
  router.get('/runs/:runId', async (request, response) => {
    const parsed = runId.safeParse(request.params['runId']);

    if (!parsed.success) {
      response.status(400).json({ error: 'input_invalid' });

      return;
    }

    try {
      const awaitedResult2 = await readSocialImageManifest(parsed.data);

      response.json(awaitedResult2);
    } catch {
      response.status(404).json({ error: 'not_found' });
    }
  });
  router.post('/runs/:runId/promote', async (request, response) => {
    const parsed = runId.safeParse(request.params['runId']);

    if (!parsed.success) {
      response.status(400).json({ error: 'input_invalid' });

      return;
    }

    try {
      const awaitedResult3 = await promoteSocialImageRun(parsed.data);

      response.json(awaitedResult3);
    } catch {
      response.status(503).json({ error: 'social_images_unavailable' });
    }
  });

  return {
    router,
    async close() {
      await Promise.all([queue.close(), events.close()]);
    },
  };
}
