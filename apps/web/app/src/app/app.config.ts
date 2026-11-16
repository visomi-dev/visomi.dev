import { provideHttpClient, withFetch } from '@angular/common/http';
import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
  withNoHttpTransferCache,
  withI18nSupport,
} from '@angular/platform-browser';

import { OwnerSession } from './shared/owner-session';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    OwnerSession,
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay(), withNoHttpTransferCache(), withI18nSupport()),
    provideRouter(appRoutes),
  ],
};
