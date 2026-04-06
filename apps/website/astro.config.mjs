import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.BASE_URL ?? '/';
const output = process.env.WEBSITE_OUTPUT_MODE === 'static' ? 'static' : 'server';
const site = process.env.SITE_URL ?? 'https://visomi.dev';

export default defineConfig({
  adapter:
    output === 'server'
      ? node({
          mode: 'middleware',
        })
      : undefined,
  base,
  output,
  outDir: '../../dist/apps/website',
  publicDir: './public',
  srcDir: './src',
  site,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
