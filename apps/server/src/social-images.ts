import { Queue, QueueEvents } from 'bullmq';
import express, { type Request, type Response } from 'express';
import IORedis from 'ioredis';

import {
  GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME,
  GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME,
  SOCIAL_IMAGE_QUEUE_NAME,
  type GeneratePageSocialImageJob,
  type GenerateWebsiteSocialImagesJob,
  promoteSocialImageRun,
  readSocialImageManifest,
} from '@visomi.dev/shared-social-images';

const createRedisConnection = () => {
  const redisUrl = process.env['REDIS_URL']?.trim();

  if (!redisUrl) {
    throw new Error('Missing required environment variable: REDIS_URL');
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });
};

const parseWaitFlag = (request: Request) => {
  const rawWait = request.query['wait'];

  if (rawWait === 'false') {
    return false;
  }

  return true;
};

const createSocialImageRuntime = () => {
  const connection = createRedisConnection();
  const queue = new Queue<GeneratePageSocialImageJob | GenerateWebsiteSocialImagesJob>(SOCIAL_IMAGE_QUEUE_NAME, {
    connection,
  });
  const queueEvents = new QueueEvents(SOCIAL_IMAGE_QUEUE_NAME, {
    connection: connection.duplicate(),
  });
  const router = express.Router();

  router.post('/website', async (request: Request, response: Response) => {
    try {
      const waitForCompletion = parseWaitFlag(request);
      const body = (request.body ?? {}) as Partial<GenerateWebsiteSocialImagesJob>;
      const job = await queue.add(GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME, {
        runId: body.runId,
        targets: body.targets,
      });

      if (!waitForCompletion) {
        response.status(202).send({ jobId: job.id, queued: true });
        return;
      }

      const result = await job.waitUntilFinished(queueEvents);
      const promotion = await promoteSocialImageRun(result.runId);

      response.send({ jobId: job.id, promotion, result });
    } catch (error: unknown) {
      response
        .status(500)
        .send({ error: error instanceof Error ? error.message : 'Failed to generate website social images.' });
    }
  });

  router.post('/page', async (request: Request, response: Response) => {
    try {
      const waitForCompletion = parseWaitFlag(request);
      const body = request.body as GeneratePageSocialImageJob;
      const job = await queue.add(GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME, body);

      if (!waitForCompletion) {
        response.status(202).send({ jobId: job.id, queued: true });
        return;
      }

      const result = await job.waitUntilFinished(queueEvents);
      const promotion = await promoteSocialImageRun(result.runId);

      response.send({ jobId: job.id, promotion, result });
    } catch (error: unknown) {
      response.status(500).send({ error: error instanceof Error ? error.message : 'Failed to generate social image.' });
    }
  });

  router.get('/runs/:runId', async (request: Request, response: Response) => {
    try {
      const runId = request.params['runId'] as string;
      const manifest = await readSocialImageManifest(runId);

      response.send(manifest);
    } catch (error: unknown) {
      response.status(404).send({ error: error instanceof Error ? error.message : 'Run manifest not found.' });
    }
  });

  router.post('/runs/:runId/promote', async (request: Request, response: Response) => {
    try {
      const runId = request.params['runId'] as string;
      const promotion = await promoteSocialImageRun(runId);

      response.send(promotion);
    } catch (error: unknown) {
      response
        .status(500)
        .send({ error: error instanceof Error ? error.message : 'Failed to promote social image run.' });
    }
  });

  const close = async () => {
    await queue.close();
    await queueEvents.close();
    await connection.quit();
  };

  return {
    close,
    router,
  };
};

export { createSocialImageRuntime };
