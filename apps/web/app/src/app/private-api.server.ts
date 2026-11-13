import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';
import { throwError } from 'rxjs';

/** Only these read-only private endpoints may receive the current SSR cookie. */
export const privateApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!/^\/api\/(?:contact\/(?:session|submissions(?:\/[1-9]\d{0,18})?)|private\/metrics)$/.test(request.url)) {
    return next(request);
  }

  const incoming = inject(REQUEST);

  if (!incoming || request.method !== 'GET') {
    return throwError(() => new HttpErrorResponse({ status: 503, statusText: 'SSR context unavailable' }));
  }

  // Angular and the production ingress policy validate this origin before render.
  // Never derive it from an arbitrary forwarded header or an API URL parameter.
  const target = new URL(request.url, new URL(incoming.url).origin);
  const cookie = incoming.headers.get('cookie');

  return next(
    request.clone({
      url: target.href,
      ...(cookie ? { setHeaders: { cookie } } : {}),
      transferCache: false,
      redirect: 'error',
    }),
  );
};
