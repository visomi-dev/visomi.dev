import type { BrowserErrorReport } from './contract';

export type RecentBrowserError = Omit<BrowserErrorReport, 'correlation'> & {
  receivedAt: string;
  release: string;
  traceId?: string;
};

export type BrowserDiagnostics = {
  windowMinutes: 15;
  limit: 50;
  events: RecentBrowserError[];
};

export type PrivateMetricsSnapshot = {
  enabled: boolean;
  scope: 'web-api' | 'web-gateway';
  windowMinutes: 15;
  traceExportEnabled: boolean;
  browserErrors?: BrowserDiagnostics | null;
  metrics: {
    requests: number;
    clientErrors: number;
    serverErrors: number;
    aborted: number;
    meanLatencyMs: number;
    maxLatencyMs: number;
  } | null;
};
