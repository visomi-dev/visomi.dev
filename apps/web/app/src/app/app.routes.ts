import type { Route } from '@angular/router';

import { dashboardGuard } from './pages/dashboard/dashboard.guard';
import { dashboardResolver } from './pages/dashboard/dashboard.resolver';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', children: [] },
  { path: 'access', loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard) },
  {
    path: 'dashboard',
    canActivate: [dashboardGuard],
    resolve: { dashboard: dashboardResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
  },
  {
    path: 'dashboard/:id',
    canActivate: [dashboardGuard],
    resolve: { dashboard: dashboardResolver },
    loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
  },
  { path: '**', redirectTo: '' },
];
