import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createProxyDiagnostic, createProxyDiagnosticMiddleware } from './proxy-diagnostic';

type Probe = Parameters<NonNullable<ReturnType<typeof createProxyDiagnostic>>>[0];
const now = Date.parse('2026-11-12T12:00:00.000Z');
const token = 'a'.repeat(43);
const environment = {
  AUTH_ORIGIN: 'https://visomi.dev',
  VISOMI_PROXY_DIAGNOSTIC_TOKEN: token,
  VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: new Date(now + 60_000).toISOString(),
};
const probe = (headers: Probe['headers'] = {}): Probe => ({
  method: 'GET',
  url: '/app/en/access',
  headers: { 'x-visomi-proxy-probe': token, ...headers },
  rawHeaders: ['X-Visomi-Proxy-Probe', token],
});

describe('temporary synthetic proxy diagnostic', () => {
  it.each([
    {},
    { ...environment, VISOMI_PROXY_DIAGNOSTIC_TOKEN: '' },
    { ...environment, VISOMI_PROXY_DIAGNOSTIC_TOKEN: 'short' },
    { ...environment, VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: '' },
    { ...environment, AUTH_ORIGIN: '' },
    { ...environment, VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: 'invalid' },
    { ...environment, VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: new Date(now).toISOString() },
    { ...environment, VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: new Date(now + 600_001).toISOString() },
    { ...environment, AUTH_ORIGIN: 'invalid' },
    { ...environment, AUTH_ORIGIN: 'http://visomi.dev' },
    { ...environment, AUTH_ORIGIN: 'https://user:pass@visomi.dev' },
    { ...environment, AUTH_ORIGIN: 'https://visomi.dev/path' },
    { ...environment, AUTH_ORIGIN: 'https://visomi.dev/?query=secret' },
    { ...environment, AUTH_ORIGIN: 'https://visomi.dev/#secret' },
  ])('is disabled on absent/invalid/expired configuration', (configuration) => {
    expect(createProxyDiagnostic(configuration, vi.fn(), () => now)).toBeUndefined();
  });

  it('emits only booleans and a constant event, never request values', () => {
    const emit = vi.fn();
    const observe = createProxyDiagnostic(environment, emit, () => now)!;

    observe(
      probe({
        'x-forwarded-for': '198.51.100.87, 192.0.2.123',
        'x-forwarded-host': 'visomi.dev',
        'x-forwarded-proto': 'https',
        forwarded: 'for=198.51.100.87',
        'x-irrelevant': 'SECRET_DO_NOT_LOG',
      }),
    );
    expect(emit).toHaveBeenCalledExactlyOnceWith({
      event: 'proxy.synthetic_probe',
      xffPresent: true,
      xffIsString: true,
      xffContainsSyntheticClaim: true,
      xffEqualsSyntheticClaim: false,
      forwardedPresent: true,
      forwardedProtoIsHttps: true,
      forwardedHostMatchesOrigin: true,
    });
    expect(JSON.stringify(emit.mock.calls)).not.toMatch(/198\.51|192\.0|SECRET_DO_NOT_LOG|visomi\.dev|aaaaaa/);
  });

  it('distinguishes absent, exactly synthetic, and non-string XFF without logging values', () => {
    const emit = vi.fn();
    const observe = createProxyDiagnostic(environment, emit, () => now)!;

    observe(probe());
    observe(probe({ 'x-forwarded-for': '192.0.2.123' }));
    observe(probe({ 'x-forwarded-for': ['192.0.2.123'] }));
    expect(
      emit.mock.calls.map(([value]) => [
        value.xffPresent,
        value.xffIsString,
        value.xffContainsSyntheticClaim,
        value.xffEqualsSyntheticClaim,
      ]),
    ).toEqual([
      [false, false, false, false],
      [true, true, true, true],
      [true, false, false, false],
    ]);
  });

  it.each([
    { ...probe(), method: 'POST' },
    { ...probe(), url: '/app/en/access?secret=1' },
    { ...probe(), originalUrl: '/different', url: '/app/en/access' },
    { ...probe(), url: '/different' },
    probe({ cookie: '' }),
    probe({ authorization: 'Bearer SECRET' }),
    probe({ 'x-visomi-proxy-probe': undefined }),
    probe({ 'x-visomi-proxy-probe': ['a'.repeat(43)] }),
    probe({ 'x-visomi-proxy-probe': 'short' }),
    probe({ 'x-visomi-proxy-probe': 'b'.repeat(43) }),
    { ...probe(), rawHeaders: [] },
    { ...probe(), rawHeaders: ['x-visomi-proxy-probe', token, 'X-VISOMI-PROXY-PROBE', token] },
  ])('ignores visitors, other paths, sessions and invalid credentials', (request) => {
    const emit = vi.fn();
    const observe = createProxyDiagnostic(environment, emit, () => now)!;

    observe(request);
    expect(emit).not.toHaveBeenCalled();
    observe(probe());
    expect(emit).toHaveBeenCalledOnce();
  });

  it('stops automatically at the absolute expiry and after three samples', () => {
    const emit = vi.fn();
    let clock = now;
    const observe = createProxyDiagnostic(environment, emit, () => clock)!;

    for (let index = 0; index < 4; index++) {
      observe(probe());
    }
    expect(emit).toHaveBeenCalledTimes(3);
    const expiring = createProxyDiagnostic(environment, emit, () => clock)!;

    clock = now + 60_000;
    expiring(probe());
    expect(emit).toHaveBeenCalledTimes(3);
  });

  it('accepts an original exact path and never propagates logger failures', () => {
    const emit = vi.fn(() => {
      throw new Error('logger unavailable');
    });
    const observe = createProxyDiagnostic(environment, emit, () => now)!;

    expect(() => observe({ ...probe(), originalUrl: '/app/en/access', url: '/access' })).not.toThrow();
    expect(emit).toHaveBeenCalledOnce();
  });
  it('middleware is transparent when diagnostics are disabled', () => {
    const emit = vi.fn();
    const next = vi.fn();

    createProxyDiagnosticMiddleware({}, emit)(probe() as Request, {} as Response, next);
    expect(next).toHaveBeenCalledOnce();
    expect(emit).not.toHaveBeenCalled();
  });

  it('middleware delegates to an explicit logger and always continues', () => {
    const emit = vi.fn(() => {
      throw new Error('logger unavailable');
    });
    const next = vi.fn();
    const configuration = {
      ...environment,
      VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: new Date(Date.now() + 60_000).toISOString(),
    };

    createProxyDiagnosticMiddleware(configuration, emit)(probe() as Request, {} as Response, next);
    expect(emit).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
  });

  it('default logger writes only the allowlisted JSON observation', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const next = vi.fn();
    const configuration = {
      ...environment,
      VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: new Date(Date.now() + 60_000).toISOString(),
    };

    try {
      createProxyDiagnosticMiddleware(configuration)(
        probe({ 'x-forwarded-for': '198.51.100.87' }) as Request,
        {} as Response,
        next,
      );
      expect(log).toHaveBeenCalledOnce();
      const [serialized] = log.mock.calls[0];

      expect(typeof serialized).toBe('string');
      expect(JSON.parse(serialized)).toEqual({
        event: 'proxy.synthetic_probe',
        xffPresent: true,
        xffIsString: true,
        xffContainsSyntheticClaim: false,
        xffEqualsSyntheticClaim: false,
        forwardedPresent: false,
        forwardedProtoIsHttps: false,
        forwardedHostMatchesOrigin: false,
      });
      expect(serialized).not.toContain('198.51.100.87');
      expect(next).toHaveBeenCalledOnce();
    } finally {
      log.mockRestore();
    }
  });
});
