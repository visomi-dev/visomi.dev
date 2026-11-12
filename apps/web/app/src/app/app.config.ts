import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
  withNoHttpTransferCache,
  withI18nSupport,
} from '@angular/platform-browser';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay(), withNoHttpTransferCache(), withI18nSupport()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
  ],
};
