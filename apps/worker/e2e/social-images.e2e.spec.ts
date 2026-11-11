import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';
import { runTestCompose, type TestCompose } from '@visomi-stack/dev-testing/lib/compose';
import { Queue, QueueEvents } from 'bullmq';
import sharp from 'sharp';

import { socialImageRedisOptions } from '@visomi.dev/shared-social-images/redis';

test('compiled gateway and worker validate, generate, deduplicate and recover after Redis interruption', async ({
  request,
}) => {
  const root = resolve(workspaceRoot, 'tmp/worker-fixture');
  const awaitedResult1 = await readFile(resolve(root, 'fixture.json'), 'utf8');
  const fixture = JSON.parse(awaitedResult1) as {
    redisUrl: string;
    compose: TestCompose;
  };
  const connection = socialImageRedisOptions(fixture.redisUrl);
  const queue = new Queue('social-images', { connection });
  const events = new QueueEvents('social-images', { connection });

  queue.on('error', () => {
    /* Redis outage is asserted through the HTTP result. */
  });
  events.on('error', () => {
    /* Redis outage is asserted through the HTTP result. */
  });
  const endpoint = '/api/internal/social-images/page';
  const headers = { authorization: 'Bearer synthetic-internal-social-image-token-32-bytes' };
  const data = { runId: 'synthetic-run', target: { locale: 'es', page: 'home' } };

  try {
    const denied = await request.post(endpoint, { data });

    expect(denied.status()).toBe(403);
    expect(denied.headers()['cache-control']).toBe('no-store');
    const traversal = await request.post(endpoint, { headers, data: { ...data, runId: '../escape' } });

    expect(traversal.status()).toBe(400);
    const oversized = await request.post('/api/internal/social-images/website', {
      headers,
      data: { targets: Array(11).fill(data.target) },
    });

    expect(oversized.status()).toBe(400);
    // A direct Redis producer cannot bypass worker validation.
    const invalid = await queue.add('generate-page-social-image', { ...data, runId: '../escape' }, { attempts: 3 });

    await expect(invalid.waitUntilFinished(events, 10000)).rejects.toThrow('social_image_input_invalid');

    const failed = await queue.getJob(invalid.id!);

    expect(failed?.attemptsMade).toBe(1);
    const unknown = await queue.add('synthetic-unsupported', data);

    await expect(unknown.waitUntilFinished(events, 10000)).rejects.toThrow('social_image_job_invalid');

    const generated = await request.post(endpoint, { headers, data });

    expect(generated.status()).toBe(200);
    const result = await generated.json();

    expect(result.result.artifacts).toHaveLength(1);
    expect(result.promotion.copied).toHaveLength(2);
    for (const prefix of ['apps/web/site/public', 'dist/apps/web/site/client']) {
      const png = await sharp(resolve(root, prefix, 'images/seo/es/home.png')).metadata();

      expect(png).toMatchObject({ format: 'png', width: 1200, height: 630 });
    }
    const duplicate = await request.post(endpoint, { headers, data });

    expect(duplicate.status()).toBe(200);
    const awaitedResult2 = await duplicate.json();

    expect(awaitedResult2.jobId).toBe(result.jobId);
    const job = await queue.getJob(result.jobId);

    expect(job?.attemptsMade).toBe(1);
    const recoveryData = { ...data, runId: 'synthetic-recovery' };

    await runTestCompose(fixture.compose, ['stop', 'redis']);

    const started = Date.now();
    const unavailable = await request.post(endpoint, { headers, data: recoveryData });

    expect(unavailable.status()).toBe(503);
    expect(Date.now() - started).toBeLessThan(10000);
    const awaitedResult3 = await unavailable.json();

    expect(awaitedResult3).toEqual({ error: 'social_images_unavailable' });

    await runTestCompose(fixture.compose, ['start', 'redis']);

    // Observe Redis readiness without consuming the production HTTP rate-limit budget.
    await expect
      .poll(
        async () => {
          const client = await queue.client;

          return client.ping();
        },
        { timeout: 30000, intervals: [1000, 2000, 3000] },
      )
      .toBe('PONG');

    await expect
      .poll(
        async () => {
          const retried = await request.post(endpoint, { headers, data: recoveryData });

          return retried.status();
        },
        { timeout: 30000, intervals: [10000] },
      )
      .toBe(200);
  } finally {
    await runTestCompose(fixture.compose, ['start', 'redis']);

    await queue.close();

    await events.close();
  }
});
