import type { RequestHandler, Response } from 'express';

import type { PrivateMetricsSnapshot } from '@visomi-stack/web-shared-observability/lib/private-metrics';

type Bucket = {
  requests: number;
  clientErrors: number;
  serverErrors: number;
  aborted: number;
  totalLatencyMs: number;
  maxLatencyMs: number;
};

export type PrivateMetrics = { middleware: RequestHandler; snapshot(): PrivateMetricsSnapshot };

export function createPrivateMetrics(options: {
  scope: PrivateMetricsSnapshot['scope'];
  enabled?: boolean;
  traceExportEnabled?: boolean;
  clock?: () => number;
}): PrivateMetrics {
  const enabled = options.enabled === true;
  const clock = options.clock ?? Date.now;
  const buckets = new Map<number, Bucket>();
  const observed = new WeakSet<Response>();

  const prune = (now: number) => {
    const minute = Math.floor(now / 60000);

    for (const key of buckets.keys()) {
      if (key < minute - 14 || key > minute) {
        buckets.delete(key);
      }
    }

    return minute;
  };

  const middleware: RequestHandler = (_request, response, next) => {
    if (!enabled || observed.has(response)) {
      next();

      return;
    }

    observed.add(response);
    const started = clock();
    const complete = () => {
      response.off('finish', complete);
      response.off('close', complete);
      const now = clock();
      const minute = prune(now);
      const bucket = buckets.get(minute) ?? {
        requests: 0,
        clientErrors: 0,
        serverErrors: 0,
        aborted: 0,
        totalLatencyMs: 0,
        maxLatencyMs: 0,
      };
      const elapsed = Math.max(0, Math.min(60000, now - started));

      bucket.requests++;
      bucket.totalLatencyMs += elapsed;
      bucket.maxLatencyMs = Math.max(bucket.maxLatencyMs, elapsed);

      if (!response.writableFinished) {
        bucket.aborted++;
      } else if (response.statusCode >= 500) {
        bucket.serverErrors++;
      } else if (response.statusCode >= 400) {
        bucket.clientErrors++;
      }

      buckets.set(minute, bucket);
    };

    response.once('finish', complete);
    response.once('close', complete);
    next();
  };

  const snapshot = (): PrivateMetricsSnapshot => {
    prune(clock());
    const total = { requests: 0, clientErrors: 0, serverErrors: 0, aborted: 0, totalLatencyMs: 0, maxLatencyMs: 0 };

    for (const bucket of buckets.values()) {
      total.requests += bucket.requests;
      total.clientErrors += bucket.clientErrors;
      total.serverErrors += bucket.serverErrors;
      total.aborted += bucket.aborted;
      total.totalLatencyMs += bucket.totalLatencyMs;
      total.maxLatencyMs = Math.max(total.maxLatencyMs, bucket.maxLatencyMs);
    }

    return {
      enabled,
      scope: options.scope,
      windowMinutes: 15,
      traceExportEnabled: options.traceExportEnabled === true,
      metrics: enabled
        ? {
            requests: total.requests,
            clientErrors: total.clientErrors,
            serverErrors: total.serverErrors,
            aborted: total.aborted,
            meanLatencyMs: total.requests ? total.totalLatencyMs / total.requests : 0,
            maxLatencyMs: total.maxLatencyMs,
          }
        : null,
    };
  };

  return { middleware, snapshot };
}
