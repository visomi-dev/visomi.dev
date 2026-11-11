import { serveTestApplication } from '@visomi-stack/dev-testing/lib/playwright/support/serve';

void serveTestApplication('web-api').catch(() => {
  process.stderr.write('isolated_http_test_startup_failed\n');
  process.exitCode = 1;
});
