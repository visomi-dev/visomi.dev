import { test } from '@playwright/test';

import { captureOgImage, ogRoutes } from './website-og-utils';

test.describe('website og previews', () => {
  for (const route of ogRoutes) {
    test(`${route.locale} ${route.name}`, async ({ browser }) => {
      await captureOgImage(browser, route);
    });
  }
});
