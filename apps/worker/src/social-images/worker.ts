import { Worker } from 'bullmq';

import { workerConfig } from '../config.js';
import { createRedisConnection } from '../redis.js';

import { closeBrowser } from './browser.js';
import { processSocialImageJob } from './processor.js';

import { SOCIAL_IMAGE_QUEUE_NAME } from '@visomi.dev/shared-social-images';
import type { GeneratePageSocialImageJob, GenerateWebsiteSocialImagesJob } from '@visomi.dev/shared-social-images';

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

  worker.on('completed', (job) => {
    console.log(`[ worker ] completed ${job.name} (${job.id ?? 'unknown'})`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[ worker ] failed ${job?.name ?? 'unknown'} (${job?.id ?? 'unknown'})`, error);
  });

  const close = async () => {
    await worker.close();
    await closeBrowser();
    await connection.quit();
  };

  return { close, worker };
};

export { startSocialImageWorker };
