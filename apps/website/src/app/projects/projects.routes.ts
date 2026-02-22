import { Route } from '@angular/router';

export const projectsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/projects-page').then((m) => m.ProjectsPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./feature/project-detail-page').then((m) => m.ProjectDetailPage),
  },
];
