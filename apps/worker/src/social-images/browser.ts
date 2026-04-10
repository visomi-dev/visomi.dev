import { access } from 'node:fs/promises';

import { launch, type Browser } from 'puppeteer-core';

import { SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from '@visomi.dev/shared-social-images';

const chromiumPathCandidates = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
];

let browserPromise: Promise<Browser> | null = null;

const findExecutablePath = async (configuredPath?: string) => {
  if (configuredPath) {
    await access(configuredPath);
    return configuredPath;
  }

  for (const candidate of chromiumPathCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error('Could not resolve a Chromium executable. Set PUPPETEER_EXECUTABLE_PATH.');
};

const getBrowser = async (configuredPath?: string) => {
  if (!browserPromise) {
    browserPromise = findExecutablePath(configuredPath)
      .then((executablePath) =>
        launch({
          args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
          executablePath,
          headless: true,
        }),
      )
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }

  return browserPromise;
};

const closeBrowser = async () => {
  if (!browserPromise) {
    return;
  }

  const browser = await browserPromise;

  browserPromise = null;
  await browser.close();
};

const renderPng = async (html: string, filePath: string, configuredPath?: string) => {
  const browser = await getBrowser(configuredPath);
  const page = await browser.newPage();

  try {
    await page.setViewport({
      deviceScaleFactor: 1,
      height: SOCIAL_IMAGE_HEIGHT,
      width: SOCIAL_IMAGE_WIDTH,
    });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: filePath, type: 'png' });
  } finally {
    await page.close();
  }
};

export { closeBrowser, renderPng };
