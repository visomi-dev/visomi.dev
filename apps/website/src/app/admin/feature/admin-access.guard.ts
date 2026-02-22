import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAccessGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAdmin = false;

  return isAdmin ? true : router.createUrlTree(['/']);
};
