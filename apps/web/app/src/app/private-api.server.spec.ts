import { HttpRequest, HttpResponse } from '@angular/common/http';
import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { privateApiInterceptor } from './private-api.server';

function invoke(url: string, incoming: Request | null, method = 'GET') {
  TestBed.configureTestingModule({ providers: [{ provide: REQUEST, useValue: incoming }] });
  const next = vi.fn((_request: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));
  const request = new HttpRequest(method, url, null);
  const result = TestBed.runInInjectionContext(() => privateApiInterceptor(request, next));

  return { next, result, request };
}

describe('private API SSR transport', () => {
  it.each(['/api/contact/session', '/api/contact/submissions', '/api/contact/submissions/123', '/api/private/metrics'])(
    'forwards the request cookie only to the same-origin read endpoint %s',
    (path) => {
      const { next } = invoke(
        path,
        new Request('https://visomi.dev/app/en/dashboard', {
          headers: { cookie: 'synthetic=owner', 'x-forwarded-host': 'attacker.invalid' },
        }),
      );
      const forwarded = next.mock.calls[0][0] as HttpRequest<unknown>;

      expect(forwarded.url).toBe('https://visomi.dev' + path);
      expect(forwarded.headers.get('cookie')).toBe('synthetic=owner');
      expect(forwarded.headers.has('x-forwarded-host')).toBe(false);
      expect(forwarded.transferCache).toBe(false);
      expect(forwarded.redirect).toBe('error');
    },
  );

  it.each([
    'https://attacker.invalid/api/contact/session',
    '//attacker.invalid/api/contact/session',
    '/api/auth/session',
    '/api/contact/submissions/..',
    '/api/contact/submissions/%2e%2e',
    '/api/contact/submissions/..\\..\\auth\\session',
  ])('never copies SSR cookies to other targets %s', (url) => {
    const { next, request } = invoke(
      url,
      new Request('https://visomi.dev/app/en/', {
        headers: { cookie: 'synthetic=owner' },
      }),
    );

    expect(next).toHaveBeenCalledWith(request);
    expect(request.headers.has('cookie')).toBe(false);
  });

  it('does not invent a session for anonymous requests', () => {
    const { next } = invoke('/api/contact/session', new Request('https://visomi.dev/app/en/'));

    expect((next.mock.calls[0][0] as HttpRequest<unknown>).headers.has('cookie')).toBe(false);
  });

  it.each([
    ['GET', null],
    ['POST', new Request('https://visomi.dev/app/en/')],
  ])('fails closed for missing request context or mutations: %s', async (method, incoming) => {
    const { next, result } = invoke('/api/contact/session', incoming, method);

    await expect(firstValueFrom(result)).rejects.toMatchObject({ status: 503 });

    expect(next).not.toHaveBeenCalled();
  });
});
