import { Routes } from '@angular/router';

import { statsResolver } from './landing/stats-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
    resolve: {
      stats: statsResolver,
    },
  },

  {
    path: $localize`:@@routesResume:resume`,
    loadComponent: () => import('./resume/resume').then((m) => m.Resume),
  },
];
