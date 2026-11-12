const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const concurrency = Number(process.env['WORKER_CONCURRENCY'] ?? '1');

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) {
  throw new Error('worker_concurrency_invalid');
}

const workerConfig = {
  chromiumExecutablePath: process.env['PUPPETEER_EXECUTABLE_PATH']?.trim(),
  concurrency,
  redisUrl: getRequiredEnv('REDIS_URL'),
};

export { workerConfig };
