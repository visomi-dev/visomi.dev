import { DestroyRef, InjectionToken, Injectable, inject } from '@angular/core';

import type { BrowserErrorCode } from '@visomi-stack/web-shared-observability/lib/contract';
import type { createBrowserReporter } from '@visomi-stack/web-shared-observability/lib/browser';

// The browser entrypoint owns initialization; SSR never receives a reporter.
export const BROWSER_ERROR_REPORTER = new InjectionToken<ReturnType<typeof createBrowserReporter>>(
  'BrowserErrorReporter',
);

@Injectable()
export class BrowserTelemetry {
  private readonly reporter = inject(BROWSER_ERROR_REPORTER, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly cleanup = this.destroyRef.onDestroy(() => {
    this.reporter?.stop();
    this.reporter?.consent.stop();
  });

  report(code: BrowserErrorCode, error?: unknown, correlation?: string): void {
    void this.reporter?.report(code, error, undefined, correlation);
  }
}
