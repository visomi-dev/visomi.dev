import { isDevMode, type ApplicationConfig } from '@angular/core';

import { createBrowserReporter } from '@visomi-stack/web-shared-observability/lib/browser';

import { BROWSER_ERROR_REPORTER } from './observability/browser-telemetry';

export function startBrowser(
  bootstrap: (configuration: ApplicationConfig) => Promise<unknown>,
  configuration: ApplicationConfig,
  browser: Window,
): Promise<void> {
  const reporter = createBrowserReporter('web-app', browser, { globalErrors: false });

  return bootstrap({
    ...configuration,
    providers: [...configuration.providers, { provide: BROWSER_ERROR_REPORTER, useValue: reporter }],
  })
    .then(() => undefined)
    .catch((error: unknown) => {
      if (isDevMode()) {
        console.error(error);
      }

      return reporter.report('startup_failed', error).finally(() => reporter.stop());
    });
}
