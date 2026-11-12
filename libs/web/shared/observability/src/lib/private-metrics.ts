export type PrivateMetricsSnapshot = {
  enabled: boolean;
  scope: 'web-api' | 'web-gateway';
  windowMinutes: 15;
  traceExportEnabled: boolean;
  metrics: {
    requests: number;
    clientErrors: number;
    serverErrors: number;
    aborted: number;
    meanLatencyMs: number;
    maxLatencyMs: number;
  } | null;
};
