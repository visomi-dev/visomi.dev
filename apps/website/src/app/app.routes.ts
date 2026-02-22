import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./projects/projects.routes').then((m) => m.projectsRoutes),
  },
  {
    path: 'resume',
    loadChildren: () => import('./resume/resume.routes').then((m) => m.resumeRoutes),
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('./contact/contact.routes').then((m) => m.contactRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
];
