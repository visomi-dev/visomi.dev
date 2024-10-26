import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { SeoService } from './shared/seo/seo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: $localize`:@@commonLocale:en-US` },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: $localize`:@@commonCurrency:USD`,
    },

    provideExperimentalZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideClientHydration(),

    provideRouter(routes),

    SeoService,
  ],
};
