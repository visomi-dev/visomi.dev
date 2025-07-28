import { Routes } from '@angular/router';

import { statsResolver } from './landing/stats-resolver';
import { RESUME_PATH } from './constants/paths';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
    resolve: {
      stats: statsResolver,
    },
  },

  {
    path: RESUME_PATH,
    loadComponent: () => import('./resume/resume').then((m) => m.Resume),
  },
];
