import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authenticationFixture, password } from './support/auth';

describe('production owner dashboard boundary', () => {
  const fixture = authenticationFixture();

  beforeEach(() => {
    vi.stubEnv('OWNER_EMAIL', 'owner@example.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('removes registration and account-management endpoints from the production API', async () => {
    const client = await fixture.client('/api/auth');

    for (const path of ['/password/sign-up', '/email/start', '/passkeys/register/start', '/password/reset/start']) {
      const response = await client.call('POST', path, {});

      expect(response.status).toBe(404);
      expect(response.response.headers.get('cache-control')).toContain('no-store');
    }
  });

  it('requires the configured existing owner, second factor, rotated session and server authorization', async () => {
    await fixture.signup('owner@example.test');

    const other = await fixture.signup('another@example.test');
    const otherRead = await fetch(fixture.origin + '/api/contact/submissions/1', {
      headers: { cookie: other.browser.cookie },
    });

    expect(otherRead.status).toBe(403);
    const anonRead = await fetch(fixture.origin + '/api/contact/submissions');

    expect(anonRead.status).toBe(401);
    const client = await fixture.client('/api/auth');
    const originalCookie = client.cookie;
    const nonOwner = await client.call('POST', '/password/sign-in', { email: other.email, password });

    expect(nonOwner.status).toBe(403);
    const pending = await client.call('POST', '/password/sign-in', { email: 'owner@example.test', password });

    expect(pending.status).toBe(202);
    const beforeProof = await fetch(fixture.origin + '/api/contact/submissions', {
      headers: { cookie: client.cookie },
    });

    expect(beforeProof.status).toBe(401);
    const complete = await client.call('POST', '/password/verify', {
      flowId: pending.data.flowId,
      factor: { kind: 'email', code: fixture.lastCode('owner@example.test') },
    });

    expect(complete.status).toBe(200);
    expect(client.cookie).not.toBe(originalCookie);
    const list = await fetch(fixture.origin + '/api/contact/submissions', { headers: { cookie: client.cookie } });

    expect(list.status).toBe(200);
    expect(list.headers.get('cache-control')).toContain('no-store');
    const logout = await client.call('POST', '/logout', {});

    expect(logout.status).toBe(204);
    const revoked = await fetch(fixture.origin + '/api/contact/submissions', { headers: { cookie: client.cookie } });

    expect(revoked.status).toBe(401);
  });

  it('denies a verified email when the configured immutable owner identity differs', async () => {
    vi.stubEnv('OWNER_EMAIL', 'identity-check@example.test');

    await fixture.signup('identity-check@example.test');

    vi.stubEnv('OWNER_USER_ID', 'different-owner-id');
    const client = await fixture.client('/api/auth');
    const pending = await client.call('POST', '/password/sign-in', { email: 'identity-check@example.test', password });
    const response = await client.call('POST', '/password/verify', {
      flowId: pending.data.flowId,
      factor: { kind: 'email', code: fixture.lastCode('identity-check@example.test') },
    });

    expect(response.status).toBe(403);
    const list = await fetch(fixture.origin + '/api/contact/submissions', { headers: { cookie: client.cookie } });

    expect(list.status).toBe(401);
  });

  it('fails closed without owner configuration and rejects invalid session cookies', async () => {
    vi.stubEnv('OWNER_EMAIL', '');
    const session = await fetch(fixture.origin + '/api/auth/session');

    expect(session.status).toBe(503);
    const response = await fetch(fixture.origin + '/api/contact/submissions/1', {
      headers: { cookie: 'visomi.sid=invalid' },
    });

    expect(response.status).toBe(401);
    const awaitedResult1 = await response.text();

    expect(awaitedResult1).not.toContain('password');
  });
});
