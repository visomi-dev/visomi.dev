import { expect, test } from '@playwright/test';

const email = 'visomi.dev@gmail.com';

for (const locale of [
  { home: '/', contact: '/contact/', resume: '/resume/', contactLabel: '// CONTACT' },
  { home: '/es/', contact: '/es/contact/', resume: '/es/resume/', contactLabel: '// CONTACTO' },
]) {
  test.describe(`public email ${locale.home}`, () => {
    test('serves narrowly scoped Cloudflare exceptions in built HTML', async ({ request }) => {
      for (const route of [locale.home, locale.contact, locale.resume]) {
        const response = await request.get(route);

        expect(response.ok()).toBeTruthy();
        const html = await response.text();
        const exceptions = [...html.matchAll(/<!--email_off-->([\s\S]*?)<!--\/email_off-->/g)];

        expect(exceptions.length).toBeGreaterThan(0);

        for (const [, content] of exceptions) {
          // Each exemption encloses only this public mailto link, never a page or form.
          expect(content.trim()).toMatch(/^<a\s[^>]*href="mailto:visomi\.dev@gmail\.com"[^>]*>[\s\S]*<\/a>$/);
          expect(content.match(/<a\s/g)).toHaveLength(1);
        }

        const protectedHtml = html.replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, '');

        expect(protectedHtml).not.toContain(`href="mailto:${email}"`);
      }
    });

    test('keeps the contact email visible on direct, internal and history navigation', async ({ page }) => {
      await page.route('**/cdn-cgi/**', (route) => route.abort());

      const link = page.getByRole('link', { name: email, exact: true });

      await page.goto(locale.contact);

      await expect(link).toBeVisible();

      await expect(link).toHaveAttribute('href', `mailto:${email}`);

      await page.goto(locale.home);

      await page.evaluate(() => Reflect.set(window, '__publicEmailNavigation', true));

      await page.getByRole('navigation').getByRole('link', { name: locale.contactLabel, exact: true }).first().click();

      await expect(page).toHaveURL(locale.contact);

      await expect(link).toBeVisible();

      await expect(link).toHaveAttribute('href', `mailto:${email}`);

      const usedClientRouter = await page.evaluate(() => Reflect.get(window, '__publicEmailNavigation'));

      expect(usedClientRouter).toBe(true);

      await page.goBack();

      await expect(page).toHaveURL(locale.home);

      await page.goForward();

      await expect(page).toHaveURL(locale.contact);

      await expect(link).toBeVisible();

      await expect(link).toHaveAttribute('href', `mailto:${email}`);
    });
  });
}
