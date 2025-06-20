import { Routes } from '@angular/router';

import { statsResolver } from './home/stats-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    resolve: {
      stats: statsResolver,
    },
  },

  {
    path: $localize`:@@routesResume:resume`,
    loadComponent: () => import('./resume/resume').then((m) => m.Resume),
  },
];
