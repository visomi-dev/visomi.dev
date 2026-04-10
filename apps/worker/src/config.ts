const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const workerConfig = {
  chromiumExecutablePath: process.env['PUPPETEER_EXECUTABLE_PATH']?.trim(),
  concurrency: Number(process.env['WORKER_CONCURRENCY'] ?? '1'),
  redisUrl: getRequiredEnv('REDIS_URL'),
};

export { workerConfig };
