import { describe, expect, it, vi } from 'vitest';

import type { PrivateMetricsSnapshot } from '@visomi-stack/web-shared-observability/lib/private-metrics';

import { authenticationFixture } from './support/auth';

describe('owner-only technical measurements', () => {
  const fixture = authenticationFixture();

  it('denies anonymous/non-owner requests and returns only aggregate fields to a verified owner', async () => {
    const anonymous = await fetch(fixture.origin + '/api/private/metrics');

    expect(anonymous.status).toBe(401);
    const outsider = await fixture.signup();
    const denied = await fetch(fixture.origin + '/api/private/metrics', {
      headers: { cookie: outsider.browser.cookie },
    });

    expect(denied.status).toBe(403);
    const owner = await fixture.signup('owner@example.test');
    const response = await fetch(fixture.origin + '/api/private/metrics?private=secret@example.test', {
      headers: { cookie: owner.browser.cookie },
    });
    const payload: PrivateMetricsSnapshot = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('vary')).toContain('Cookie');
    expect(payload).toMatchObject({ enabled: true, scope: 'web-api', traceExportEnabled: false });
    expect(payload.metrics!.requests).toBeGreaterThan(0);
    expect(JSON.stringify(payload)).not.toMatch(/example.test|secret|cookie|email|password/);
    expect(Object.keys(payload.metrics!).sort()).toEqual([
      'aborted',
      'clientErrors',
      'maxLatencyMs',
      'meanLatencyMs',
      'requests',
      'serverErrors',
    ]);
    const visitResponse = await fetch(fixture.origin + '/api/private/visits?period=7', {
      headers: { cookie: owner.browser.cookie },
    });
    const status = await visitResponse.json();

    expect(status).toEqual({ state: 'disabled' });
  });
});

describe('owner-only visit analytics', () => {
  const summary = vi.fn((period: 7 | 30) =>
    Promise.resolve({ state: 'ready' as const, period, firstDay: '2026-11-17', days: [] }),
  );
  const fixture = authenticationFixture({ visits: { summary } });

  it('denies the public and enforces the supported period options for the owner', async () => {
    const url = fixture.origin + '/api/private/visits';
    const denied = await fetch(url + '?period=7');

    expect(denied.status).toBe(401);
    const owner = await fixture.signup('owner@example.test');
    const options = { headers: { cookie: owner.browser.cookie } };
    const invalid = await fetch(url + '?period=1', options);

    expect(invalid.status).toBe(400);
    const week = await fetch(url + '?period=7', options);
    const month = await fetch(url + '?period=30', options);

    expect(week.status).toBe(200);
    expect(month.status).toBe(200);
    expect(month.headers.get('cache-control')).toContain('no-store');
    expect(summary.mock.calls).toEqual([[7], [30]]);
  });
});
