import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, takeUntil } from 'rxjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { OwnerSession } from './owner-session';
import { sessionInterceptor } from './interceptor';

const realtime = vi.hoisted(() => {
  const listeners = new Map<string, (...args: unknown[]) => void>();
  const socket = {
    active: true,
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => listeners.set(event, listener)),
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(() => listeners.clear()),
  };

  return { listeners, socket, io: vi.fn(() => socket) };
});

vi.mock('socket.io-client', () => ({ io: realtime.io }));

let session: OwnerSession;
let http: HttpTestingController;
const router = { url: '/admin/dashboard', navigate: vi.fn().mockResolvedValue(true) };
const owner = { authenticated: true, csrfToken: 'synthetic-csrf', user: { id: 'synthetic-owner' } };

beforeEach(() => {
  realtime.listeners.clear();
  realtime.socket.active = true;
  vi.clearAllMocks();
  router.url = '/admin/dashboard';
  router.navigate.mockClear();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([sessionInterceptor])),
      provideHttpClientTesting(),
      { provide: Router, useValue: router },
    ],
  });

  session = TestBed.inject(OwnerSession);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  try {
    http.verify();
  } finally {
    TestBed.resetTestingModule();
  }
});

it('drops a late session response after invalidation and refreshes the CSRF token without replaying mutations', async () => {
  const old = session.revalidate();
  const previous = http.expectOne('/api/auth/session');

  session.invalidate();
  const fresh = session.revalidate();

  previous.flush(owner);

  await old;

  expect(session.valid()).toBe(false);
  http.expectOne('/api/auth/session').flush({ ...owner, csrfToken: 'synthetic-rotated' });

  await Promise.resolve();

  http.expectOne('/api/contact/session').flush({ owner: true });

  await fresh;

  expect(session.valid()).toBe(true);

  const token = await session.csrf();

  expect(token).toBe('synthetic-rotated');
});

it('clears private visibility and redirects on expiry or failed revalidation', async () => {
  const first = session.revalidate();

  http.expectOne('/api/auth/session').flush(owner);

  await Promise.resolve();

  http.expectOne('/api/contact/session').flush({ owner: true });

  await first;

  const expired = session.revalidate();

  http.expectOne('/api/auth/session').flush({ authenticated: false, csrfToken: 'anonymous', user: null });

  await expired;

  expect(session.valid()).toBe(false);
  expect(router.navigate).toHaveBeenCalledWith(['/admin/auth/sign-in'], { replaceUrl: true });
  const failed = session.revalidate();

  http.expectOne('/api/auth/session').flush({}, { status: 503, statusText: 'Unavailable' });

  await failed;

  expect(session.valid()).toBe(false);
});

async function authorizeOwner() {
  const pending = session.revalidate();

  http.expectOne('/api/auth/session').flush(owner);

  await Promise.resolve();

  http.expectOne('/api/contact/session').flush({ owner: true });

  await pending;
}

it.each([true, false])(
  'preserves authorized pending reads after a socket connection failure (active=%s)',
  async (active) => {
    await authorizeOwner();

    const cancelled = vi.fn();

    session.cancelled.subscribe(cancelled);
    const read = firstValueFrom(TestBed.inject(HttpClient).get('/api/contact/submissions/42')).catch(() => null);
    const request = http.expectOne('/api/contact/submissions/42');

    realtime.socket.active = active;
    realtime.listeners.get('connect_error')?.(new Error('synthetic transport failure'));

    expect(request.cancelled).toBe(false);
    expect(session.valid()).toBe(true);
    expect(cancelled).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    http.expectNone('/api/auth/session');
    expect(realtime.io).toHaveBeenCalledTimes(1);

    request.flush({ item: { id: '42' } });

    await expect(read).resolves.toEqual({ item: { id: '42' } });
  },
);

it.each(['session:changed', 'disconnect'])('still revalidates and denies a revoked session on %s', async (event) => {
  await authorizeOwner();

  const read = firstValueFrom(TestBed.inject(HttpClient).get('/api/contact/submissions/42')).catch(() => null);
  const request = http.expectOne('/api/contact/submissions/42');

  realtime.listeners.get(event)?.('io server disconnect');

  expect(request.cancelled).toBe(true);
  expect(session.valid()).toBe(false);
  http.expectOne('/api/auth/session').flush({ authenticated: false, csrfToken: 'anonymous', user: null });

  await session.revalidate();

  await expect(read).resolves.toBeNull();

  expect(router.navigate).toHaveBeenCalledWith(['/admin/auth/sign-in'], { replaceUrl: true });
});

it.each(['network', 'server'] as const)(
  'retains access and reports a %s logout failure without announcing success',
  async (failure) => {
    await authorizeOwner();

    const cancelled = vi.fn();

    session.cancelled.subscribe(cancelled);
    const result = session.signOut();
    const rejected = expect(result).rejects.toMatchObject({ status: failure === 'network' ? 0 : 500 });

    await Promise.resolve();

    const request = http.expectOne('/api/auth/logout');

    expect(request.request.headers.get('x-csrf-token')).toBe(owner.csrfToken);

    if (failure === 'network') {
      request.error(new ProgressEvent('error'));
    } else {
      request.flush({}, { status: 500, statusText: 'Server error' });
    }

    await rejected;

    expect(session.valid()).toBe(true);
    expect(cancelled).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    const token = await session.csrf();

    expect(token).toBe(owner.csrfToken);
  },
);

it('invalidates and redirects only after the server acknowledges logout', async () => {
  await authorizeOwner();

  const cancelled = vi.fn();

  session.cancelled.subscribe(cancelled);
  const result = session.signOut();

  await Promise.resolve();

  const request = http.expectOne('/api/auth/logout');

  expect(session.valid()).toBe(true);
  expect(router.navigate).not.toHaveBeenCalled();

  request.flush({ ok: true });

  await result;

  expect(session.valid()).toBe(false);
  expect(cancelled).toHaveBeenCalledOnce();
  expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/admin/auth/sign-in'], { replaceUrl: true });
});

it.each([
  '/admin/contacts/42',
  '/admin/contacts/42?view=full',
  '/app/en/admin/contacts/42',
  '/app/es/admin/contacts/42',
])('redirects an expired session from contact detail %s', async (path) => {
  router.url = path;

  await authorizeOwner();

  const pending = session.revalidate();

  http.expectOne('/api/auth/session').flush({ authenticated: false, csrfToken: 'anonymous', user: null });

  await pending;

  expect(session.valid()).toBe(false);
  expect(router.navigate).toHaveBeenCalledWith(['/admin/auth/sign-in'], { replaceUrl: true });
});

it('cancels an in-flight private read if ownership is revoked without changing the authenticated identity', async () => {
  await authorizeOwner();

  const read = firstValueFrom(TestBed.inject(HttpClient).get('/api/contact/submissions'));
  const rejected = expect(read).rejects.toThrow();
  const request = http.expectOne('/api/contact/submissions');
  const pending = session.revalidate();

  http.expectOne('/api/auth/session').flush(owner);

  await Promise.resolve();

  http.expectOne('/api/contact/session').flush({ owner: false });

  await pending;

  await rejected;

  expect(request.cancelled).toBe(true);
  expect(session.valid()).toBe(false);
  expect(router.navigate).toHaveBeenCalledWith(['/admin/auth/sign-in'], { replaceUrl: true });
});

it('does not cancel an in-progress sign-in when a public-page check still sees an anonymous session', async () => {
  router.url = '/admin/auth/sign-in';
  const anonymous = { authenticated: false, csrfToken: 'anonymous', user: null };
  const initial = session.revalidate();

  http.expectOne('/api/auth/session').flush(anonymous);

  await initial;

  const signIn = firstValueFrom(
    TestBed.inject(HttpClient).post('/api/auth/password/sign-in', {}).pipe(takeUntil(session.cancelled)),
  );
  const mutation = http.expectOne('/api/auth/password/sign-in');
  const check = session.revalidate();

  http.expectOne('/api/auth/session').flush(anonymous);

  await check;

  expect(mutation.cancelled).toBe(false);
  expect(router.navigate).not.toHaveBeenCalled();

  mutation.flush({ flowId: 'synthetic-flow' });

  await expect(signIn).resolves.toEqual({ flowId: 'synthetic-flow' });
});
