import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { appRoutes } from './app.routes';
import { Deps } from './shared/deps';
import { Settings } from './shared/settings';
import { UI } from './shared/ui';
import { SEO } from './shared/seo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(appRoutes),

    Deps,
    Settings,
    UI,
    SEO,
  ],
};
