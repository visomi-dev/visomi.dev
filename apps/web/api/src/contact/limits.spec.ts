import { contactLimits } from './limits';

it('bounds hashed transient counters, expires windows and supports rate-limit lifecycle', async () => {
  vi.useFakeTimers();

  try {
    const store = contactLimits(1000, 2);

    const awaitedResult1 = await store.increment('synthetic-key');

    expect(awaitedResult1).toMatchObject({ totalHits: 1 });
    const awaitedResult2 = await store.increment('synthetic-key');

    expect(awaitedResult2).toMatchObject({ totalHits: 2 });
    const awaitedResult3 = await store.increment('synthetic-key');

    expect(awaitedResult3).toMatchObject({ totalHits: 3 });
    const awaitedResult4 = await store.increment('synthetic-key');

    expect(awaitedResult4).toMatchObject({ totalHits: 3 });

    await store.decrement('synthetic-key');

    await store.decrement('missing');

    const awaitedResult5 = await store.increment('synthetic-key');

    expect(awaitedResult5).toMatchObject({ totalHits: 3 });

    await store.resetKey('synthetic-key');

    const awaitedResult6 = await store.increment('synthetic-key');

    expect(awaitedResult6).toMatchObject({ totalHits: 1 });

    await store.decrement('synthetic-key');

    await store.decrement('synthetic-key');

    const awaitedResult7 = await store.increment('synthetic-key');

    expect(awaitedResult7).toMatchObject({ totalHits: 1 });
    vi.advanceTimersByTime(1001);
    const awaitedResult8 = await store.increment('synthetic-key');

    expect(awaitedResult8).toMatchObject({ totalHits: 1 });
    for (let index = 0; index < 10000; index++) {
      await store.increment(String(index));
    }
    const awaitedResult9 = await store.increment('overflow');

    expect(awaitedResult9).toMatchObject({ totalHits: 3 });
    vi.advanceTimersByTime(1001);
    const awaitedResult10 = await store.increment('recovered');

    expect(awaitedResult10).toMatchObject({ totalHits: 1 });

    await store.shutdown?.();

    const awaitedResult11 = await store.increment('recovered');

    expect(awaitedResult11).toMatchObject({ totalHits: 1 });
  } finally {
    vi.useRealTimers();
  }
});
