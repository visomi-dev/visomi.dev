import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/apps/website',
      include: [
        'src/content/site-content.ts',
        'src/i18n/translations.ts',
        'src/scripts/background.ts',
        'src/scripts/navbar.ts',
        'src/scripts/page-navigation-loader.ts',
        'src/scripts/projects.ts',
        'src/scripts/theme-switcher.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
