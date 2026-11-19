import { browserErrorKinds } from './contract';
import type {
  BrowserApplication,
  BrowserErrorCode,
  BrowserErrorKind,
  BrowserErrorReport,
  BrowserScreen,
} from './contract';

export type UnhandledErrorCode = Exclude<BrowserErrorCode, 'request_failed'>;

// Only known page names cross the boundary; paths and navigation history stay in the browser.
export function browserScreen(path: string): BrowserScreen {
  if (/^\/app\/(?:en|es)\/admin\/auth\/sign-in\/?$/.test(path)) {
    return 'admin_sign_in';
  }

  if (/^\/app\/(?:en|es)\/admin\/dashboard\/?$/.test(path)) {
    return 'admin_dashboard';
  }

  if (/^\/app\/(?:en|es)\/admin\/contacts\/[1-9]\d{0,18}\/?$/.test(path)) {
    return 'admin_contact';
  }

  if (/^\/app\/(?:en|es)\/admin\/metrics\/?$/.test(path)) {
    return 'admin_metrics';
  }

  if (/^\/app\/(?:en|es)\/admin\/visits\/?$/.test(path)) {
    return 'admin_visits';
  }

  if (path === '/' || /^(?:\/app)?\/(?:en|es)\/?$/.test(path) || /^\/app\/(?:en|es)\/foundations\/?$/.test(path)) {
    return 'home';
  }

  return /^(?:\/app)?\/(?:en|es)\/ui\/?$/.test(path) ? 'ui' : 'unknown';
}

export function browserErrorKind(error: unknown): BrowserErrorKind {
  try {
    const name = error instanceof Error ? error.name : undefined;

    return browserErrorKinds.find((kind) => kind === name) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export function describeBrowserError(
  application: BrowserApplication,
  path: string,
  code: BrowserErrorCode,
  error: unknown,
): BrowserErrorReport {
  return { application, code, kind: browserErrorKind(error), screen: browserScreen(path) };
}
