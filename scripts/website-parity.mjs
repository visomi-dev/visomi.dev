import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

import { accessibilityColorRules } from './parity-accessibility.mjs';

const mode = process.argv[2];

assert(['baseline', 'compare'].includes(mode), 'Use baseline or compare');
const origin = process.env.PARITY_URL ?? 'http://127.0.0.1:8181';

assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Parity runs only against local fixtures');
const originalBaseline = 'docs/migration/parity/baseline';
const accessibilityBaseline = 'docs/migration/parity/accessibility-baseline';
const adjusted = process.env.PARITY_ACCESSIBILITY_BASELINE === 'true';

assert(!adjusted || mode === 'baseline', 'Contrast reference is captured only from the original baseline');
const baseline = adjusted || mode === 'compare' ? accessibilityBaseline : originalBaseline;
const output = mode === 'baseline' ? baseline : 'artifacts/migration/parity';

await mkdir(output, { recursive: true });

// Fontconfig differs between developer hosts and CI; capture grayscale text on both.
const browser = await chromium.launch({ args: ['--disable-lcd-text'] });
const results = [];

try {
  for (const locale of ['en', 'es']) {
    for (const theme of ['light', 'dark']) {
      for (const [viewport, width, height] of [
        ['mobile', 375, 812],
        ['desktop', 1440, 900],
      ]) {
        const context = await browser.newContext({
          viewport: { width, height },
          deviceScaleFactor: 1,
          colorScheme: theme,
          reducedMotion: 'reduce',
        });

        await context.addInitScript((value) => {
          const frame = window.requestAnimationFrame.bind(window);
          const cancel = window.cancelAnimationFrame.bind(window);
          const pending = new Set();

          window.requestAnimationFrame = (callback) => {
            const id = frame((time) => {
              pending.delete(id);
              callback(time);
            });

            pending.add(id);

            return id;
          };
          window.__stopParityAnimations = () => {
            for (const id of pending) {
              cancel(id);
            }
            pending.clear();
          };
          localStorage.setItem('theme', value);
          localStorage.setItem('visomi-theme', value);
        }, theme);

        for (const pageName of ['home', 'journey', 'projects', 'resume', 'contact']) {
          const path = `${locale === 'es' ? '/es' : ''}/${pageName === 'home' ? '' : `${pageName}/`}`;
          const page = await context.newPage();
          const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });

          assert.equal(response.status(), 200, path);

          await page.evaluate(async (value) => {
            await document.fonts.ready;

            for (const image of document.images) {
              image.loading = 'eager';
            }

            await Promise.all([...document.images].map((image) => image.decode()));

            document.documentElement.classList.toggle('dark', value === 'dark');
            window.__stopParityAnimations();
            document.querySelectorAll('canvas').forEach((canvas) => {
              canvas.style.visibility = 'hidden';
            });
          }, theme);

          let contrastChanges;

          if (adjusted) {
            const reference = await context.newPage();
            const referenceOrigin = process.env.PARITY_REFERENCE_URL ?? 'http://127.0.0.1:8182';

            assert(['localhost', '127.0.0.1'].includes(new URL(referenceOrigin).hostname));

            await reference.goto(`${referenceOrigin}${path}`, { waitUntil: 'networkidle' });

            const awaitedResult1 = await reference.evaluate(
              (rules) => ({
                mutedDark: getComputedStyle(document.documentElement).getPropertyValue('--color-muted-dark'),
                colors: rules.map((rule) => {
                  const element = [...document.querySelectorAll('[class]')].find((element) =>
                    rule.after.every((name) => element.classList.contains(name)),
                  );

                  return { before: rule.before, color: element ? getComputedStyle(element).color : null };
                }),
              }),
              accessibilityColorRules.filter((rule) => rule.pages.includes(pageName)),
            );

            contrastChanges = awaitedResult1;

            await reference.close();

            await page.evaluate((changes) => {
              document.documentElement.style.setProperty('--color-muted-dark', changes.mutedDark);
              // Snapshot elements before changing inherited colors; only text color is adjusted.
              const elements = [...document.querySelectorAll('[class]')];

              for (const rule of changes.colors) {
                if (!rule.color) {
                  continue;
                }

                for (const element of elements) {
                  if (rule.before.every((name) => element.classList.contains(name))) {
                    element.style.setProperty('color', rule.color, 'important');
                  }
                }
              }
            }, contrastChanges);
          }

          const name = `${locale}-${theme}-${viewport}-${pageName}`;
          const metadata = await page.evaluate(() => ({
            title: document.title,
            text: document.body.innerText.replace(/\s+/g, ' ').trim(),
            canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
            alternates: [...document.querySelectorAll('link[hreflang]')].map((link) => [
              link.getAttribute('hreflang'),
              link.getAttribute('href'),
            ]),
          }));

          await page.screenshot({ path: join(output, `${name}.png`), fullPage: true, animations: 'disabled' });

          if (mode === 'baseline') {
            await writeFile(join(output, `${name}.json`), JSON.stringify(metadata, null, 2) + '\n');

            if (adjusted) {
              await writeFile(join(output, `${name}-colors.json`), JSON.stringify(contrastChanges, null, 2) + '\n');
            }

            results.push({ name, path, status: 'captured' });
          } else {
            const awaitedResult2 = await readFile(join(baseline, `${name}.json`), 'utf8');

            assert.deepEqual(metadata, JSON.parse(awaitedResult2), `${name}: content or metadata changed`);
            const before = await sharp(join(baseline, `${name}.png`))
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true });
            const after = await sharp(join(output, `${name}.png`))
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true });

            assert.deepEqual(after.info, before.info, `${name}: page dimensions changed`);
            let changed = 0;

            for (let i = 0; i < before.data.length; i += 4) {
              if ([0, 1, 2].some((channel) => Math.abs(before.data[i + channel] - after.data[i + channel]) > 20)) {
                changed++;
              }
            }
            const ratio = changed / (before.info.width * before.info.height);
            const original = await sharp(join(originalBaseline, `${name}.png`))
              .ensureAlpha()
              .raw()
              .toBuffer();
            let originalChangedPixels = 0;

            for (let i = 0; i < original.length; i += 4) {
              if ([0, 1, 2].some((channel) => Math.abs(original[i + channel] - after.data[i + channel]) > 20)) {
                originalChangedPixels++;
              }
            }
            results.push({
              name,
              path,
              changedPixels: changed,
              ratio,
              originalChangedPixels,
              originalRatio: originalChangedPixels / (before.info.width * before.info.height),
            });
            assert(ratio <= 0.002, `${name}: visual difference ${ratio}`);
          }

          await page.close();
        }

        await context.close();
      }
    }
  }
} finally {
  await browser.close();

  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}
console.log(`${results.length} parity cases ${mode === 'baseline' ? 'captured' : 'passed'}`);
