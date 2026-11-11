import { defineMiddleware } from 'astro:middleware';
import { documentPolicy } from '@visomi-stack/web-backend-shared/lib/http/document-policy';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

const applySecurityHeaders = (response: Response) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
};

export const onRequest = defineMiddleware(async (context, next) => {
  let response = await next();

  if (response.headers.get('content-type')?.includes('text/html')) {
    const html = await response.text();

    response = new Response(html, response);
    response.headers.set('Content-Security-Policy', documentPolicy(html));
  }

  if (context.url.pathname.startsWith('/api/')) {
    return response;
  }

  applySecurityHeaders(response);

  const pathname = context.url.pathname;
  const isContactPage =
    pathname === '/contact' ||
    pathname === '/contact/' ||
    pathname.startsWith('/contact/') ||
    pathname === '/es/contact' ||
    pathname === '/es/contact/' ||
    pathname.startsWith('/es/contact/');

  if (isContactPage) {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Vary', 'Cookie');
  } else {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
  }

  return response;
});
