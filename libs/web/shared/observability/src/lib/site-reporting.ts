import { createBrowserReporter } from './browser';
import type { BrowserConsent } from './consent';
import { trackVisits } from './visit-browser';
import { siteVisitPage } from './visits';

export function createSiteReporting(browser: Window, consent: BrowserConsent, documentPermit: string | null) {
  const reporter = createBrowserReporter('web-site', browser, consent, { documentPermit, globalErrors: false });

  trackVisits(browser, consent, siteVisitPage, {
    ignoreCurrent: !documentPermit || consent.permit() !== documentPermit,
  });

  return reporter;
}
