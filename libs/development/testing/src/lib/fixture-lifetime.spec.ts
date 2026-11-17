import { setImmediate } from 'node:timers/promises';

import { expect, it, vi } from 'vitest';

import { runFixture } from './fixture-lifetime';

it.each(['SIGTERM', 'SIGINT'] as const)(
  'cancels setup on %s and awaits resources acquired during cancellation',
  async (event) => {
    const initial = process.listenerCount(event);
    const cleanup = vi.fn().mockResolvedValue(undefined);
    const done = runFixture(async ({ signal, onCleanup }) => {
      process.emit(event);

      await setImmediate();

      onCleanup(cleanup);
      expect(signal.aborted).toBe(true);
      signal.throwIfAborted();
    });

    await expect(done).resolves.toBeUndefined();

    expect(cleanup).toHaveBeenCalledOnce();
    expect(process.listenerCount(event)).toBe(initial);
  },
);

it('keeps a ready fixture alive and makes repeated stop signals share awaited cleanup', async () => {
  let release: () => void = () => undefined;
  const cleaned = new Promise<void>((resolve) => {
    release = resolve;
  });
  const cleanup = vi.fn(() => cleaned);
  const done = runFixture(async ({ onCleanup }) => {
    onCleanup(cleanup);
  });

  await setImmediate();

  process.emit('SIGTERM');
  process.emit('SIGTERM');

  await setImmediate();

  expect(cleanup).toHaveBeenCalledOnce();
  let finished = false;

  void done.then(() => {
    finished = true;
  });

  await setImmediate();

  expect(finished).toBe(false);
  release();

  await done;

  expect(finished).toBe(true);
});

it('cleans every resource after setup failure and preserves that failure', async () => {
  const failure = new Error('synthetic_setup');
  const cleanup = vi.fn().mockResolvedValue(undefined);

  await expect(
    runFixture(async ({ onCleanup }) => {
      onCleanup(cleanup);

      throw failure;
    }),
  ).rejects.toBe(failure);

  expect(cleanup).toHaveBeenCalledOnce();
});

it('reports cleanup failure without exposing its payload or skipping other resources', async () => {
  const cleanup = vi.fn().mockResolvedValue(undefined);

  await expect(
    runFixture(async ({ onCleanup, stop }) => {
      onCleanup(async () => {
        throw new Error('SYNTHETIC_PRIVATE_CLEANUP');
      });
      onCleanup(cleanup);
      stop();
    }),
  ).rejects.toThrow(/^fixture_cleanup_failed$/);

  expect(cleanup).toHaveBeenCalledOnce();
});
