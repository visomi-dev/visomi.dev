import { createBrowserConsent } from '@visomi-stack/web-shared-observability/lib/consent';
import type { BrowserErrorReport } from '@visomi-stack/web-shared-observability/lib/contract';
import {
  describeBrowserError,
  type UnhandledErrorCode,
} from '@visomi-stack/web-shared-observability/lib/error-description';
import { loadSiteReporting } from '@visomi-stack/web-shared-observability/lib/browser-loader';
import type { createBrowserReporter } from '@visomi-stack/web-shared-observability/lib/browser';

const consent = createBrowserConsent(window);
const documentPermit = consent.permit() ?? null;
let earlyReports = 0;
let reporter: ReturnType<typeof createBrowserReporter> | undefined;
let loading: Promise<NonNullable<typeof reporter>> | undefined;
let open: HTMLButtonElement | null = null;
let cleanupControls: (() => void) | undefined;
let boundNotice: HTMLElement | null | undefined;

function syncReports(): void {
  if (open) {
    open.hidden = !!consent.permit() || !reporter?.pending().length;
  }
}

function load() {
  loading ??= loadSiteReporting().then(({ createSiteReporting }) => {
    reporter = createSiteReporting(window, consent, documentPermit);

    reporter.subscribePending(syncReports);

    return reporter;
  });

  return loading;
}

function ignoreImportFailure(): void {
  // A failed optional import must not become another pending exception.
}

function reportAfterLoad(report: BrowserErrorReport, permit: string | undefined): void {
  const capturedAt = Date.now();

  void load()
    .then((ready) => {
      if (permit) {
        return ready.sendCaptured(report, permit);
      }

      ready.remember(report, capturedAt);

      return;
    })
    .catch(ignoreImportFailure);
}

function capture(code: UnhandledErrorCode, error: unknown, source?: ErrorEvent): void {
  if (reporter) {
    void reporter.report(code, error, source);

    return;
  }

  const report = describeBrowserError('web-site', location.pathname, code, error);
  const permit = consent.permit();

  if (earlyReports++ < 5) {
    reportAfterLoad(report, permit);
  }
}

window.addEventListener('error', (event) => capture('unhandled_exception', event.error, event));
window.addEventListener('unhandledrejection', (event) => capture('unhandled_rejection', event.reason));

if (documentPermit) {
  void load().catch(ignoreImportFailure);
}

function bindPrivacyControls(): void {
  const controls = document.querySelector('[data-browser-privacy]');
  const nextOpen = controls?.querySelector<HTMLButtonElement>('[data-open]') ?? null;
  const notice = document.querySelector<HTMLElement>('[data-consent]');

  if (open === nextOpen && boundNotice === notice) {
    return;
  }

  boundNotice = notice;
  const dialog = controls?.querySelector('dialog');
  let disconnectDialog: (() => void) | undefined;
  let disconnectConfirmation: (() => void) | undefined;
  const confirmationLifetime = new AbortController();
  let disconnected = false;
  let consentChanged: (() => void) | undefined;

  cleanupControls?.();
  open = nextOpen;
  syncReports();

  if (controls && nextOpen && dialog) {
    nextOpen.onclick = () => {
      void Promise.all([load(), import('./browser-privacy')])
        .then(([ready, { connectBrowserPrivacy }]) => {
          if (disconnected) {
            return;
          }

          disconnectDialog ??= connectBrowserPrivacy(controls, ready);

          if (!dialog.open) {
            dialog.showModal();
          }
        })
        .catch(ignoreImportFailure);
    };
    dialog.onclose = () => {
      if (nextOpen.hidden) {
        document.querySelector<HTMLElement>('[data-brand-home]')?.focus();
      }
    };
  }

  const settings = notice?.dataset['consent'] === 'settings';

  if (notice && (settings || !consent.decided())) {
    const root = notice.closest<HTMLElement>('[data-consent-root]')!;
    const accept = notice.querySelector<HTMLButtonElement>('[data-choice=accept]')!;
    const reject = notice.querySelector<HTMLButtonElement>('[data-choice=reject]')!;
    const status = notice.querySelector<HTMLElement>('[data-choice-status]')!;
    const sync = () => {
      const grant = consent.permit();

      if (grant && !settings) {
        notice.hidden = true;
      }

      accept.disabled = consent.blocked();
      status.textContent =
        status.dataset[accept.disabled ? 'blocked' : grant ? 'on' : consent.decided() ? 'off' : ''] ?? '';
    };

    notice.hidden = false;
    reject.onclick = () => consent.decide(false);
    accept.onclick = () => {
      const fresh = !settings && !consent.permit();
      let startedAt = performance.now();

      consent.decide(true);
      const grant = fresh && consent.permit();

      if (grant) {
        window.addEventListener('pagehide', () => (startedAt = -Infinity), {
          once: true,
          signal: confirmationLifetime.signal,
        });
        void import('./consent-confirmation')
          .then(({ confirmConsent }) => {
            if (!disconnected) {
              disconnectConfirmation = confirmConsent(root, consent, grant, startedAt);
            }
          })
          .catch(ignoreImportFailure);
      }
    };
    consentChanged = consent.subscribe(sync);
    sync();
  }

  cleanupControls = () => {
    disconnected = true;
    confirmationLifetime.abort();
    disconnectDialog?.();
    disconnectConfirmation?.();
    consentChanged?.();
  };
}

consent.subscribe(() => {
  if (consent.permit()) {
    void load().catch(ignoreImportFailure);
  }
});

document.addEventListener('astro:page-load', bindPrivacyControls);
document.addEventListener('astro:before-swap', () => {
  cleanupControls?.();
  boundNotice = undefined;
});
bindPrivacyControls();
