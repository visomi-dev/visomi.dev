import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Browser } from '@playwright/test';

import type { ScreenshotRoute } from './website-screenshot-utils';

const ogRoutes = [
  { locale: 'en', name: 'home', path: '/og/en/home/' },
  { locale: 'es', name: 'home', path: '/og/es/home/' },
  { locale: 'en', name: 'journey', path: '/og/en/journey/' },
  { locale: 'es', name: 'journey', path: '/og/es/journey/' },
  { locale: 'en', name: 'projects', path: '/og/en/projects/' },
  { locale: 'es', name: 'projects', path: '/og/es/projects/' },
  { locale: 'en', name: 'resume', path: '/og/en/resume/' },
  { locale: 'es', name: 'resume', path: '/og/es/resume/' },
  { locale: 'en', name: 'contact', path: '/og/en/contact/' },
  { locale: 'es', name: 'contact', path: '/og/es/contact/' },
] satisfies ScreenshotRoute[];

const ogOutputRoot = join(process.cwd(), 'artifacts/apps/website-e2e/og');

export const captureOgImage = async (browser: Browser, route: ScreenshotRoute) => {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    screen: { width: 1200, height: 630 },
    viewport: { width: 1200, height: 630 },
  });
  const page = await context.newPage();

  try {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await page.evaluate(async () => {
      try {
        await document.fonts.ready;
      } catch (_error) {
        // Ignore browser-side readiness failures so screenshots can still complete.
      }
    });

    const outputDirectory = join(ogOutputRoot, route.locale);

    await mkdir(outputDirectory, { recursive: true });

    await page.screenshot({
      path: join(outputDirectory, `${route.name}.png`),
      fullPage: false,
      scale: 'css',
    });
  } finally {
    await context.close();
  }
};

export { ogRoutes };
