import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { devices, type Browser, type BrowserContextOptions, type Page } from '@playwright/test';

export type ScreenshotRoute = {
  locale: 'en' | 'es';
  name: 'home' | 'journey' | 'projects' | 'resume' | 'contact';
  path: string;
};

export type ScreenshotViewport = {
  name: string;
  context: BrowserContextOptions;
};

export const routesByPage = {
  contact: [
    { locale: 'en', name: 'contact', path: '/contact/' },
    { locale: 'es', name: 'contact', path: '/es/contact/' },
  ],
  home: [
    { locale: 'en', name: 'home', path: '/' },
    { locale: 'es', name: 'home', path: '/es/' },
  ],
  journey: [
    { locale: 'en', name: 'journey', path: '/journey/' },
    { locale: 'es', name: 'journey', path: '/es/journey/' },
  ],
  projects: [
    { locale: 'en', name: 'projects', path: '/projects/' },
    { locale: 'es', name: 'projects', path: '/es/projects/' },
  ],
  resume: [
    { locale: 'en', name: 'resume', path: '/resume/' },
    { locale: 'es', name: 'resume', path: '/es/resume/' },
  ],
} as const satisfies Record<string, ScreenshotRoute[]>;

export const viewports: readonly ScreenshotViewport[] = [
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

export const captureScreenshot = async (browser: Browser, route: ScreenshotRoute, viewport: ScreenshotViewport) => {
  const context = await browser.newContext(viewport.context);
  const page = await context.newPage();

  try {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    await waitForPageToSettle(page);

    const outputDirectory = join(screenshotsRoot, route.locale, viewport.name);

    await mkdir(outputDirectory, { recursive: true });

    await page.screenshot({
      path: join(outputDirectory, `${route.name}.png`),
      fullPage: true,
      scale: 'css',
    });
  } finally {
    await context.close();
  }
};
