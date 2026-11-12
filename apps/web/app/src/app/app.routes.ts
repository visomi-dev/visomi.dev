import type { Route } from '@angular/router';

import { ownerGuard } from './shared/guards/owner.guard';
import { dashboardResolver } from './pages/dashboard/dashboard.resolver';
import { metricsResolver } from './pages/metrics/metrics.resolver';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', children: [] },
  {
    path: 'metrics',
    canActivate: [ownerGuard],
    resolve: { metrics: metricsResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () => import('./pages/metrics/metrics').then((module) => module.Metrics),
  },
  { path: 'access', loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard) },
  {
    path: 'dashboard',
    canActivate: [ownerGuard],
    resolve: { dashboard: dashboardResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
  },
  {
    path: 'dashboard/:id',
    canActivate: [ownerGuard],
    resolve: { dashboard: dashboardResolver },
    loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
  },
  { path: '**', redirectTo: '' },
];
