import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export const ownerGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<{ owner: boolean }>('/api/contact/session').pipe(
    map((session) => (session.owner === true ? true : router.createUrlTree(['/access']))),
    catchError(() => of(router.createUrlTree(['/access']))),
  );
};
