import { once } from 'node:events';

type FixtureLifetime = {
  signal: AbortSignal;
  onCleanup: (cleanup: () => Promise<void>) => void;
  stop: () => void;
};

// Install cancellation before acquiring resources, and await cleanup before leaving the process.
export async function runFixture(setup: (lifetime: FixtureLifetime) => Promise<void>): Promise<void> {
  const controller = new AbortController();
  const cleanups: (() => Promise<void>)[] = [];
  const stop = () => controller.abort();
  let failure: { error: unknown } | undefined;

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);

  try {
    await setup({ signal: controller.signal, onCleanup: (cleanup) => cleanups.push(cleanup), stop });

    if (!controller.signal.aborted) {
      await once(controller.signal, 'abort');
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      failure = { error };
    }
  } finally {
    const results = await Promise.allSettled(cleanups.map((cleanup) => Promise.resolve().then(cleanup)));

    process.off('SIGTERM', stop);
    process.off('SIGINT', stop);

    if (results.some((result) => result.status === 'rejected')) {
      failure = { error: new Error('fixture_cleanup_failed') };
    }
  }

  if (failure) {
    throw failure.error;
  }
}
