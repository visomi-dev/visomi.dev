import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.BASE_URL ?? '/';
const output = process.env.WEBSITE_OUTPUT_MODE === 'static' ? 'static' : 'server';
const site = process.env.SITE_URL ?? 'https://visomi.dev';
const publicUrl = new URL(site);

export default defineConfig({
  actions:
    output === 'server'
      ? {
          rpc: false,
        }
      : undefined,
  adapter: node({
    mode: 'middleware',
  }),
  base,
  output,
  outDir: '../../../dist/apps/web/site',
  publicDir: './public',
  srcDir: './src',
  site,
  // Restore the public HTTPS origin behind ingress without trusting arbitrary forwarded hosts.
  security: {
    allowedDomains: [{ hostname: publicUrl.hostname, protocol: publicUrl.protocol.slice(0, -1), port: publicUrl.port }],
  },
  build: { inlineStylesheets: 'never' },
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    resolve: { tsconfigPaths: true },
    build: { assetsInlineLimit: 0 },
    plugins: [tailwindcss()],
  },
});
