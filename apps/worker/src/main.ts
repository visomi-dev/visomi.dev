import { startSocialImageWorker } from './social-images/worker';

const bootstrap = async () => {
  const { close } = startSocialImageWorker();

  const shutdown = async (signal: string) => {
    console.log(`[ worker ] shutting down after ${signal}`);

    await close();

    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  console.log('[ worker ] social image worker ready');
};

bootstrap().catch(() => {
  console.error('[ worker ] failed to bootstrap worker');
  process.exit(1);
});
