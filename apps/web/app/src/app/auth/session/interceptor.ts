import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, takeUntil, throwError } from 'rxjs';

import { OwnerSession } from './owner-session';

export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  if (!/^\/api\/(?:contact\/submissions(?:\/|$)|private\/metrics$)/.test(request.url)) {
    return next(request);
  }

  const session = inject(OwnerSession);

  return next(request).pipe(
    takeUntil(session.cancelled),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        session.invalidate();
        void session.revalidate();
      }

      return throwError(() => error);
    }),
  );
};
