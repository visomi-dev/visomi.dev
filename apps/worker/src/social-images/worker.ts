import { Worker } from 'bullmq';

import type {
  GeneratePageSocialImageJob,
  GenerateWebsiteSocialImagesJob,
} from '@visomi.dev/shared-social-images/types';
import { SOCIAL_IMAGE_QUEUE_NAME } from '@visomi.dev/shared-social-images/types';

import { workerConfig } from '../config';
import { createRedisConnection } from '../redis';

import { closeBrowser } from './browser';
import { processSocialImageJob } from './processor';

const startSocialImageWorker = () => {
  const connection = createRedisConnection(workerConfig.redisUrl);
  const worker = new Worker<GeneratePageSocialImageJob | GenerateWebsiteSocialImagesJob>(
    SOCIAL_IMAGE_QUEUE_NAME,
    async (job) => processSocialImageJob(job.name, job.data, workerConfig.chromiumExecutablePath),
    {
      connection,
      concurrency: workerConfig.concurrency,
    },
  );

  worker.on('completed', () => {
    console.log('[ worker ] social image job completed');
  });
  worker.on('error', () => {
    console.error('[ worker ] queue unavailable');
  });

  worker.on('failed', () => {
    console.error('[ worker ] social image job failed');
  });

  const close = async () => {
    await closeBrowser();

    await worker.close();
  };

  return { close, worker };
};

export { startSocialImageWorker };
