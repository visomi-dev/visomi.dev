import { Route } from '@angular/router';

export const contactRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/contact-page').then((m) => m.ContactPage),
  },
];
