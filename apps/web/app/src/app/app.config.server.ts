import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ErrorHandler, mergeApplicationConfig, type ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ServerErrors } from './shared/observability/server-errors';
import { privateApiInterceptor } from './admin/private-api.server';

const serverConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: ServerErrors },
    provideHttpClient(withFetch(), withInterceptors([privateApiInterceptor])),
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
