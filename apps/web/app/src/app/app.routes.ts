import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((module) => module.adminRoutes) },
  { path: '**', loadComponent: () => import('./not-found/not-found').then((module) => module.NotFound) },
];
