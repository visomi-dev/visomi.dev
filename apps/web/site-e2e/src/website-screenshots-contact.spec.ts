import { test } from '@playwright/test';

import { captureScreenshot, routesByPage, viewports } from './website-screenshot-utils';

test.describe('website screenshots', () => {
  test.setTimeout(300_000);

  for (const route of routesByPage.contact) {
    for (const viewport of viewports) {
      test(`${route.locale} ${route.name} ${viewport.name}`, async ({ browser }) => {
        await captureScreenshot(browser, route, viewport);
      });
    }
  }
});
