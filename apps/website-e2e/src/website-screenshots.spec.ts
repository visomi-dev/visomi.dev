import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { devices, test, type BrowserContextOptions, type Page } from '@playwright/test';

const locales = [
  {
    code: 'en',
    routes: [
      { name: 'home', path: '/' },
      { name: 'journey', path: '/journey/' },
      { name: 'projects', path: '/projects/' },
      { name: 'resume', path: '/resume/' },
      { name: 'contact', path: '/contact/' },
    ],
  },
  {
    code: 'es',
    routes: [
      { name: 'home', path: '/es/' },
      { name: 'journey', path: '/es/journey/' },
      { name: 'projects', path: '/es/projects/' },
      { name: 'resume', path: '/es/resume/' },
      { name: 'contact', path: '/es/contact/' },
    ],
  },
] as const;

const viewports: Array<{ name: string; context: BrowserContextOptions }> = [
  {
    name: 'mobile-sm',
    context: {
      ...devices['iPhone SE'],
      viewport: { width: 375, height: 667 },
      screen: { width: 375, height: 667 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    },
  },
  {
    name: 'mobile-md',
    context: {
      ...devices['iPhone 12'],
      viewport: { width: 390, height: 844 },
      screen: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    },
  },
  {
    name: 'mobile-lg',
    context: {
      ...devices['iPhone 14 Plus'],
      viewport: { width: 430, height: 932 },
      screen: { width: 430, height: 932 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    },
  },
  {
    name: 'desktop-hd',
    context: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 },
      screen: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    },
  },
  {
    name: 'desktop-fhd',
    context: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
      screen: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    },
  },
  {
    name: 'desktop-4k',
    context: {
      ...devices['Desktop Chrome'],
      viewport: { width: 3840, height: 2160 },
      screen: { width: 3840, height: 2160 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    },
  },
] as const;

const screenshotsRoot = join(process.cwd(), 'artifacts/apps/website-e2e');

const waitForPageToSettle = async (page: Page) => {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    try {
      await document.fonts.ready;
    } catch (_error) {
      // Ignore browser-side readiness failures so screenshots can still complete.
    }
  });
  await page.waitForTimeout(500);
};

test.describe('website screenshots', () => {
  test.setTimeout(300_000);

  for (const locale of locales) {
    for (const route of locale.routes) {
      for (const viewport of viewports) {
        test(`${locale.code} ${route.name} ${viewport.name}`, async ({ browser, browserName }) => {
          test.skip(browserName !== 'chromium', 'Screenshot coverage is generated in Chromium only.');

          const context = await browser.newContext(viewport.context);
          const page = await context.newPage();

          try {
            await page.goto(route.path, { waitUntil: 'domcontentloaded' });

            await waitForPageToSettle(page);

            const outputDirectory = join(screenshotsRoot, locale.code, viewport.name);

            await mkdir(outputDirectory, { recursive: true });

            await page.screenshot({
              path: join(outputDirectory, `${route.name}.png`),
              fullPage: true,
              scale: 'css',
            });
          } finally {
            await context.close();
          }
        });
      }
    }
  }
});
