import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Browser } from '@playwright/test';

import { routesByPage, type ScreenshotRoute } from './website-screenshot-utils';

const ogRoutes = Object.values(routesByPage)
  .flat()
  .map((route) => ({
    ...route,
    path: `/og/${route.locale}/${route.name}/`,
  })) satisfies ScreenshotRoute[];

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
