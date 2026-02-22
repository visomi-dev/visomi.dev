import { Route } from '@angular/router';

export const homeRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/introduction-page').then((m) => m.IntroductionPage),
  },
];
