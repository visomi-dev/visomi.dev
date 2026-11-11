import type { RedisOptions } from 'bullmq';

// BullMQ owns its compatible Redis client; shared stack clients may use a newer major.
export function socialImageRedisOptions(value: string): RedisOptions {
  const url = new URL(value);

  if (!['redis:', 'rediss:'].includes(url.protocol)) {
    throw new Error('redis_configuration_invalid');
  }

  const db = Number(url.pathname.slice(1) || '0');

  if (!Number.isInteger(db) || db < 0) {
    throw new Error('redis_configuration_invalid');
  }

  return {
    host: url.hostname,
    port: Number(url.port || '6379'),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db,
    maxRetriesPerRequest: null,
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}
