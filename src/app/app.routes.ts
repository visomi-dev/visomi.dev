import { Routes } from '@angular/router';

import { homeResolver } from './home/home.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component'),
    resolve: {
      home: homeResolver,
    },
  },

  {
    path: $localize`:@@routesResume:resume`,
    loadComponent: () => import('./resume/resume.component'),
  },
];
