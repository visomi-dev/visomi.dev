import type { Route } from '@angular/router';

import { ownerGuard } from './auth/owner.guard';
import { dashboardResolver } from './dashboard/dashboard.resolver';
import { metricsResolver } from './metrics/metrics.resolver';
import { visitsResolver } from './visits/visits.resolver';

export const adminRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('../not-found/not-found').then((module) => module.NotFound),
  },
  {
    path: 'auth/sign-in',
    pathMatch: 'full',
    loadComponent: () => import('./auth/sign-in/password/password').then((module) => module.Password),
  },
  {
    path: '',
    loadComponent: () => import('./admin-shell/admin-shell').then((module) => module.AdminShell),
    children: [
      {
        path: 'dashboard',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { dashboard: dashboardResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        loadComponent: () => import('./dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'contacts/:id',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { dashboard: dashboardResolver },
        loadComponent: () => import('./dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'metrics',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { metrics: metricsResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        loadComponent: () => import('./metrics/metrics').then((module) => module.Metrics),
      },
      {
        path: 'visits',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { visits: visitsResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        loadComponent: () => import('./visits/visits').then((module) => module.Visits),
      },
    ],
  },
];
