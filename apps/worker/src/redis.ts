import IORedis from 'ioredis';

const createRedisConnection = (redisUrl: string) =>
  new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });

export { createRedisConnection };
