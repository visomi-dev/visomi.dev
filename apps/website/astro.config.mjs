import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isProjectPagesDeployment = Boolean(
  process.env.GITHUB_ACTIONS && repositoryName && !repositoryName.endsWith('.github.io'),
);
const defaultBase = isProjectPagesDeployment ? `/${repositoryName}/` : '/';
const base = process.env.BASE_URL ?? defaultBase;
const site = process.env.SITE_URL ?? 'https://visomi.dev';

export default defineConfig({
  base,
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
