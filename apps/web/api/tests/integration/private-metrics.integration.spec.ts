import { describe, expect, it } from 'vitest';

import { createPrivateMetrics } from '@visomi-stack/web-backend-shared/lib/observability/lib/private-metrics';
import type { PrivateMetricsSnapshot } from '@visomi-stack/web-shared-observability/lib/private-metrics';

import { authenticationFixture } from './support/auth';

describe('owner-only technical measurements', () => {
  const metrics = createPrivateMetrics({ scope: 'web-api', enabled: true });
  const fixture = authenticationFixture({ privateMetrics: metrics });

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
  });
});

describe('metrics capture is closed by default', () => {
  const fixture = authenticationFixture();

  it('reports disabled instead of reporting fabricated zero measurements', async () => {
    const owner = await fixture.signup('owner@example.test');
    const response = await fetch(fixture.origin + '/api/private/metrics', {
      headers: { cookie: owner.browser.cookie },
    });
    const payload: PrivateMetricsSnapshot = await response.json();

    expect(response.status).toBe(200);
    expect(payload.enabled).toBe(false);
    expect(payload.metrics).toBeNull();
  });
});
