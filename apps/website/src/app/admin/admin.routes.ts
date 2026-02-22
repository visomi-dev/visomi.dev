import { Route } from '@angular/router';

import { adminAccessGuard } from './feature/admin-access.guard';

export const adminRoutes: Route[] = [
  {
    path: '',
    canActivate: [adminAccessGuard],
    loadComponent: () => import('./feature/admin-page').then((m) => m.AdminPage),
  },
];
