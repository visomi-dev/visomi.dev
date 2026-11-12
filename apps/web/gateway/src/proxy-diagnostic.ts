import { createHash, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import type { RequestHandler } from 'express';

type ProbeRequest = Pick<IncomingMessage, 'headers' | 'rawHeaders' | 'method' | 'url'> & {
  originalUrl?: string;
};

export type ProxyDiagnostic = {
  event: 'proxy.synthetic_probe';
  xffPresent: boolean;
  xffIsString: boolean;
  xffContainsSyntheticClaim: boolean;
  xffEqualsSyntheticClaim: boolean;
  forwardedPresent: boolean;
  forwardedProtoIsHttps: boolean;
  forwardedHostMatchesOrigin: boolean;
};

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const probeHeader = 'x-visomi-proxy-probe';
const syntheticClaim = '192.0.2.123'; // RFC 5737: documentation-only, never a visitor identity.

/**
 * Temporary, opt-in observation of at most three explicitly authenticated probes.
 * Never records header values, IPs, cookies, tokens, paths, or query strings.
 * An observation describes this request only; it does not prove an ingress contract.
 */
export function createProxyDiagnostic(
  environment: NodeJS.ProcessEnv,
  emit: (observation: ProxyDiagnostic) => void,
  now: () => number = Date.now,
): ((request: ProbeRequest) => void) | undefined {
  const token = environment['VISOMI_PROXY_DIAGNOSTIC_TOKEN'];
  const expiry = environment['VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT'];
  const publicOrigin = environment['AUTH_ORIGIN'];

  if (!token || !tokenPattern.test(token) || !expiry || !publicOrigin) {
    return undefined;
  }

  const expiresAt = Date.parse(expiry);
  const startedAt = now();

  if (!Number.isFinite(expiresAt) || expiresAt <= startedAt || expiresAt - startedAt > 10 * 60_000) {
    return undefined;
  }

  let host: string;

  try {
    const origin = new URL(publicOrigin);

    if (
      origin.protocol !== 'https:' ||
      origin.username ||
      origin.password ||
      origin.pathname !== '/' ||
      origin.search ||
      origin.hash
    ) {
      return undefined;
    }

    host = origin.host;
  } catch {
    return undefined;
  }

  // Retain only a fixed-size digest, not the configured token, in the observer.
  const digest = createHash('sha256').update(token).digest();
  let remaining = 3;

  return (request) => {
    if (
      remaining === 0 ||
      now() >= expiresAt ||
      request.method !== 'GET' ||
      (request.originalUrl ?? request.url) !== '/app/en/access' ||
      request.headers.cookie !== undefined ||
      request.headers.authorization !== undefined
    ) {
      return;
    }

    const supplied = request.headers[probeHeader];
    const occurrences = request.rawHeaders.filter(
      (_, index) => index % 2 === 0 && request.rawHeaders[index].toLowerCase() === probeHeader,
    ).length;

    if (
      typeof supplied !== 'string' ||
      !tokenPattern.test(supplied) ||
      occurrences !== 1 ||
      !timingSafeEqual(digest, createHash('sha256').update(supplied).digest())
    ) {
      return;
    }

    remaining--;
    const xff = request.headers['x-forwarded-for'];
    const xffText = typeof xff === 'string' ? xff : '';
    const observation: ProxyDiagnostic = {
      event: 'proxy.synthetic_probe',
      xffPresent: xff !== undefined,
      xffIsString: typeof xff === 'string',
      xffContainsSyntheticClaim: xffText.split(',').some((value) => value.trim() === syntheticClaim),
      xffEqualsSyntheticClaim: xffText.trim() === syntheticClaim,
      forwardedPresent: request.headers.forwarded !== undefined,
      forwardedProtoIsHttps: request.headers['x-forwarded-proto'] === 'https',
      forwardedHostMatchesOrigin: request.headers['x-forwarded-host'] === host,
    };

    try {
      emit(observation);
    } catch {
      // Diagnostic failures must never change the application's response.
    }
  };
}

/** A transparent adapter; disabled by default and never creates a diagnostic endpoint. */
export function createProxyDiagnosticMiddleware(
  environment: NodeJS.ProcessEnv,
  emit: (observation: ProxyDiagnostic) => void = (observation) => console.info(JSON.stringify(observation)),
): RequestHandler {
  const observe = createProxyDiagnostic(environment, emit);

  return (request, _response, next) => {
    observe?.(request);
    next();
  };
}
