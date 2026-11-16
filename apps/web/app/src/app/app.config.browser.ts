import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ErrorHandler,
  inject,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  type ApplicationConfig,
} from '@angular/core';

import { sessionInterceptor } from './shared/session-interceptor';
import { appConfig } from './app.config';
import { BrowserErrors } from './shared/observability/browser-errors';
import { browserErrorsInterceptor } from './shared/observability/browser-errors-interceptor';
import { BrowserRoutePerformance } from './shared/observability/browser-route-performance';
import { BrowserTelemetry } from './shared/observability/browser-telemetry';

const browserConfig: ApplicationConfig = {
  providers: [
    BrowserErrors,
    { provide: ErrorHandler, useExisting: BrowserErrors },
    BrowserTelemetry,
    BrowserRoutePerformance,
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, browserErrorsInterceptor])),
    provideEnvironmentInitializer(() => {
      inject(BrowserRoutePerformance);
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
