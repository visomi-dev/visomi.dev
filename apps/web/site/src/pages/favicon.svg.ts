import type { APIRoute } from 'astro';

// eslint-disable-next-line @nx/enforce-module-boundaries -- Approved workspace artwork is a static build input.
import favicon from '../../../../../assets/brand/favicon.svg?raw';

export const prerender = true;

export const GET: APIRoute = () => new Response(favicon, { headers: { 'Content-Type': 'image/svg+xml' } });
