import { Route } from '@angular/router';

export const resumeRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/resume-page').then((m) => m.ResumePage),
  },
];
