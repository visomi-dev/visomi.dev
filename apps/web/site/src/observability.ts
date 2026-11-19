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

  if (notice && (notice.dataset['consent'] === 'settings' || !consent.decided())) {
    const accept = notice.querySelector<HTMLButtonElement>('[data-choice=accept]')!;
    const status = notice.querySelector<HTMLElement>('[data-choice-status]')!;
    const sync = () => {
      accept.disabled = consent.blocked();
      status.textContent =
        status.dataset[accept.disabled ? 'blocked' : consent.permit() ? 'on' : consent.decided() ? 'off' : ''] ?? '';
    };

    notice.hidden = false;
    notice.onclick = ({ target }) => {
      if (target instanceof HTMLButtonElement && target.dataset['choice']) {
        consent.decide(target === accept);
      }
    };
    consentChanged = consent.subscribe(sync);
    sync();
  }

  cleanupControls = () => {
    disconnected = true;
    disconnectDialog?.();
    consentChanged?.();
  };
}

consent.subscribe(() => {
  if (consent.permit()) {
    void load().catch(ignoreImportFailure);
  }
});

document.addEventListener('astro:page-load', bindPrivacyControls);
bindPrivacyControls();
