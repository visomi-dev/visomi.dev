import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import type { PrivateMetricsSnapshot } from '@visomi-stack/web-shared-observability/lib/private-metrics';

export type MetricsData = { state: 'ready'; snapshot: PrivateMetricsSnapshot } | { state: 'error' };

export const metricsResolver: ResolveFn<MetricsData> = () =>
  inject(HttpClient)
    .get<PrivateMetricsSnapshot>('/api/private/metrics')
    .pipe(
      map((snapshot): MetricsData => ({ state: 'ready', snapshot })),
      catchError(() => of<MetricsData>({ state: 'error' })),
    );
