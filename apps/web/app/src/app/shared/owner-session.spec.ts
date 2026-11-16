import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { OwnerSession } from './owner-session';
import { sessionInterceptor } from './session-interceptor';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({ active: true, on: vi.fn(), connect: vi.fn(), disconnect: vi.fn(), removeAllListeners: vi.fn() })),
}));

let session: OwnerSession;
let http: HttpTestingController;
const router = { url: '/admin/dashboard', navigate: vi.fn().mockResolvedValue(true) };
const owner = { authenticated: true, csrfToken: 'synthetic-csrf', user: { id: 'synthetic-owner' } };

beforeEach(() => {
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
  http.verify();
  TestBed.resetTestingModule();
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
