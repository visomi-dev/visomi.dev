import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { catchError, defaultIfEmpty, of } from 'rxjs';

import type { VisitSummary } from '@visomi-stack/web-shared-observability/lib/visits';

const unavailable = { state: 'unavailable' } as const;

export const visitsResolver: ResolveFn<VisitSummary> = (route) => {
  const period = route.queryParamMap.get('period') === '30' ? 30 : 7;

  return inject(HttpClient)
    .get<VisitSummary>(`/api/private/visits?period=${period}`)
    .pipe(
      catchError(() => of(unavailable)),
      defaultIfEmpty(unavailable),
    );
};
