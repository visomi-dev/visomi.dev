import { EventEmitter } from 'node:events';

import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createPrivateMetrics } from './private-metrics';

function response(statusCode = 200, writableFinished = true) {
  return Object.assign(new EventEmitter(), { statusCode, writableFinished }) as unknown as Response;
}

describe('private aggregate metrics', () => {
  it('requires explicit capture opt-in and never retains request values', () => {
    const metrics = createPrivateMetrics({ scope: 'web-api' });
    const next = vi.fn();
    const request = {
      body: { email: 'private@example.test' },
      url: '/private/record?id=secret',
      headers: { authorization: 'secret' },
    } as unknown as Request;
    const result = response();

    metrics.middleware(request, result, next);
    result.emit('finish');

    expect(next).toHaveBeenCalledOnce();
    expect(result.listenerCount('finish')).toBe(0);
    expect(metrics.snapshot()).toEqual({
      enabled: false,
      scope: 'web-api',
      windowMinutes: 15,
      traceExportEnabled: false,
      metrics: null,
    });
  });

  it('aggregates HTTP outcomes once across gateway/API mounting and removes completion listeners', () => {
    let time = 0;
    const metrics = createPrivateMetrics({
      scope: 'web-gateway',
      enabled: true,
      traceExportEnabled: true,
      clock: () => time,
    });
    const next = vi.fn();
    const incoming = {
      url: '/private@example.test?secret=value',
      body: '<script>private</script>',
    } as unknown as Request;

    expect(metrics.snapshot().metrics).toMatchObject({ requests: 0, meanLatencyMs: 0 });

    for (const [status, finished] of [
      [200, true],
      [404, true],
      [503, true],
      [200, false],
    ] as const) {
      const outgoing = response(status, finished);

      metrics.middleware(incoming, outgoing, next);
      metrics.middleware(incoming, outgoing, next);
      time += 20;
      outgoing.emit(finished ? 'finish' : 'close');
      outgoing.emit('close');
      expect(outgoing.listenerCount('finish')).toBe(0);
      expect(outgoing.listenerCount('close')).toBe(0);
    }

    expect(metrics.snapshot()).toEqual({
      enabled: true,
      scope: 'web-gateway',
      windowMinutes: 15,
      traceExportEnabled: true,
      metrics: { requests: 4, clientErrors: 1, serverErrors: 1, aborted: 1, meanLatencyMs: 20, maxLatencyMs: 20 },
    });
    expect(JSON.stringify(metrics.snapshot())).not.toMatch(/secret|private@example|script/);
    expect(next).toHaveBeenCalledTimes(8);
  });

  it('bounds duration and rolling-window storage, including clock corrections', () => {
    let time = 0;
    const metrics = createPrivateMetrics({ scope: 'web-api', enabled: true, clock: () => time });
    const incoming = {} as Request;

    for (let minute = 0; minute < 40; minute++) {
      time = minute * 60000;
      const outgoing = response();

      metrics.middleware(incoming, outgoing, vi.fn());
      outgoing.emit('finish');
    }

    expect(metrics.snapshot().metrics?.requests).toBe(15);
    const long = response();

    metrics.middleware(incoming, long, vi.fn());
    time += 120000;
    long.emit('finish');
    expect(metrics.snapshot().metrics?.maxLatencyMs).toBe(60000);
    time = 0;
    expect(metrics.snapshot().metrics?.requests).toBe(0);

    const corrected = response();

    metrics.middleware(incoming, corrected, vi.fn());
    time = -1;
    corrected.emit('finish');
    expect(metrics.snapshot().metrics?.meanLatencyMs).toBe(0);
    time = 900000;
    expect(metrics.snapshot().metrics?.requests).toBe(0);
  });
});
