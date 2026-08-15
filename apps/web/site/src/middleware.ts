import { defineMiddleware } from 'astro:middleware';

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
  const response = await next();

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
