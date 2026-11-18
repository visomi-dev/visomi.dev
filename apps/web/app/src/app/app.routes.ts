import type { Route } from '@angular/router';

import { ownerGuard } from './auth/session/owner.guard';
import { dashboardResolver } from './pages/dashboard/dashboard.resolver';
import { metricsResolver } from './pages/metrics/metrics.resolver';
import { visitsResolver } from './pages/visits/visits.resolver';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    pathMatch: 'full',
    loadComponent: () => import('./pages/not-found/not-found').then((module) => module.NotFound),
  },
  {
    path: 'admin/auth/sign-in',
    pathMatch: 'full',
    loadComponent: () => import('./auth/password/sign-in/sign-in').then((module) => module.SignIn),
  },
  {
    path: 'admin',
    loadComponent: () => import('./shared/layout/admin-shell/admin-shell').then((module) => module.AdminShell),
    children: [
      {
        path: 'dashboard',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { dashboard: dashboardResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'contacts/:id',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { dashboard: dashboardResolver },
        loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'metrics',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { metrics: metricsResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        loadComponent: () => import('./pages/metrics/metrics').then((module) => module.Metrics),
      },
      {
        path: 'visits',
        pathMatch: 'full',
        canActivate: [ownerGuard],
        resolve: { visits: visitsResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        loadComponent: () => import('./pages/visits/visits').then((module) => module.Visits),
      },
    ],
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((module) => module.NotFound) },
];
