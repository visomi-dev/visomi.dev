import { expect, test } from '@playwright/test';

for (const path of [
  '/',
  '/journey/',
  '/projects/',
  '/contact/',
  '/resume/',
  '/es/',
  '/es/journey/',
  '/es/projects/',
  '/es/contact/',
  '/es/resume/',
]) {
  test(`${path} page colors follow the theme icon timing`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });

    await page.goto(path);

    const switcher = page.locator('[data-theme-switcher]');
    const active = page.locator('[data-theme-transition]');

    await expect(switcher).toBeEnabled();

    await expect(active).toHaveCount(0);

    const idleDuration = await switcher.evaluate((element) => getComputedStyle(element).transitionDuration);
    const initialBackground = await page
      .locator('body')
      .evaluate((element) => getComputedStyle(element).backgroundColor);

    for (const dark of [true, false]) {
      const motion = await switcher.evaluate(async (button) => {
        const probes = [document.body, document.querySelector('h1')!, document.querySelector('nav')!];
        const values = () =>
          probes.map((element) => {
            const style = getComputedStyle(element);

            return { background: style.backgroundColor, text: style.color, border: style.borderBottomColor };
          });

        (button as HTMLButtonElement).click();

        await Promise.resolve();

        // Flush styles in the same interaction; do not race the real cleanup timer against frame delivery.
        button.getBoundingClientRect();

        const icons = Array.from(button.querySelectorAll('svg'))
          .flatMap((icon) => icon.getAnimations())
          .filter((animation) => animation instanceof CSSAnimation);
        const colors = document.getAnimations().filter((animation) => animation instanceof CSSTransition);
        const backgrounds = Array.from(document.querySelectorAll('#light-bg, #dark-bg'))
          .flatMap((element) => element.getAnimations())
          .filter((animation) => animation instanceof CSSAnimation);
        const animations = [...icons, ...colors, ...backgrounds];
        // Sample direct paint properties. Seeking inherited colors can retarget descendant
        // transitions; their shortened reversal is a browser effect, not a second UI clock.
        const paint = colors.filter((animation) => {
          const target = (animation.effect as KeyframeEffect).target;
          const property = (animation as CSSTransition).transitionProperty;

          return (
            !(animation.effect as KeyframeEffect).pseudoElement &&
            ((target === probes[0] && property === 'background-color') ||
              (target === probes[1] && property === 'color') ||
              (target === probes[2] && property === 'border-bottom-color'))
          );
        });
        const declarations = Array.from(document.querySelectorAll('*')).every((element) => {
          const style = getComputedStyle(element);

          return (
            style.transitionDuration === '0.4s' &&
            style.transitionTimingFunction === 'ease-in-out' &&
            style.transitionDelay === '0s'
          );
        });
        const timing = [...icons, ...paint, ...backgrounds].map((animation) => ({
          duration: animation.effect!.getTiming().duration,
          easing:
            animation instanceof CSSAnimation
              ? (animation.effect as KeyframeEffect).getKeyframes()[0].easing
              : animation.effect!.getTiming().easing,
        }));

        for (const animation of animations) {
          animation.pause();
        }

        const samples = [0, 200, 399].map((time) => {
          for (const animation of animations) {
            animation.currentTime = time;
          }

          return values();
        });

        for (const animation of animations) {
          animation.finish();
        }

        return {
          icons: icons.length,
          colors: paint.length,
          backgrounds: backgrounds.length,
          declarations,
          timing,
          samples,
        };
      });

      expect(motion.icons).toBe(2);
      expect(motion.colors).toBe(3);
      expect(motion.backgrounds).toBe(2);
      expect(motion.declarations).toBe(true);
      expect(motion.timing).toEqual(motion.timing.map(() => ({ duration: 400, easing: 'ease-in-out' })));
      expect(motion.samples[1][0].background).not.toBe(motion.samples[0][0].background);
      expect(motion.samples[1][0].background).not.toBe(motion.samples[2][0].background);
      expect(motion.samples[1][1].text).not.toBe(motion.samples[0][1].text);
      expect(motion.samples[1][1].text).not.toBe(motion.samples[2][1].text);
      expect(motion.samples[1][2].border).not.toBe(motion.samples[0][2].border);
      expect(motion.samples[1][2].border).not.toBe(motion.samples[2][2].border);

      await expect(switcher).toHaveAttribute('aria-pressed', String(dark));

      await expect(active).toHaveCount(0);

      await expect(switcher).toHaveCSS('transition-duration', idleDuration);
    }

    await switcher.evaluate(async (button) => {
      (button as HTMLButtonElement).click();

      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      (button as HTMLButtonElement).click();
    });

    await expect(switcher).toHaveAttribute('aria-pressed', 'false');

    await expect(active).toHaveCount(0);

    await expect(page.locator('body')).toHaveCSS('background-color', initialBackground);

    await page.emulateMedia({ reducedMotion: 'reduce' });

    await switcher.click();

    await expect(switcher).toHaveAttribute('aria-pressed', 'true');

    const animations = await switcher
      .locator('svg')
      .evaluateAll((icons) => icons.flatMap((icon) => icon.getAnimations()).length);

    expect(animations).toBe(0);
  });

  if (path !== '/') {
    continue;
  }

  test(`${path} theme icons always enter from below and leave above`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });

    await page.goto(path);

    const switcher = page.locator('[data-theme-switcher]');

    await expect(switcher).toBeEnabled();

    const initialAnimations = await switcher
      .locator('svg')
      .evaluateAll((icons) => icons.flatMap((icon) => icon.getAnimations()).length);

    expect(initialAnimations).toBe(0);

    for (const [dark, incoming, outgoing] of [
      [true, 1, 0],
      [false, 0, 1],
      [true, 1, 0],
      [false, 0, 1],
    ] as const) {
      const motion = await switcher.evaluate(async (button) => {
        (button as HTMLButtonElement).click();

        await Promise.resolve();

        button.getBoundingClientRect();

        const icons = Array.from(button.querySelectorAll('svg'));
        const animations = icons
          .flatMap((icon) => icon.getAnimations())
          .filter((animation) => animation instanceof CSSAnimation);

        for (const animation of animations) {
          animation.pause();
        }

        const samples = [0, 200, 399].map((time) => {
          for (const animation of animations) {
            animation.currentTime = time;
          }

          return icons.map((icon) => {
            const style = getComputedStyle(icon);

            return { y: Number.parseFloat(style.translate.split(' ')[1] ?? '0'), opacity: Number(style.opacity) };
          });
        });

        for (const animation of animations) {
          animation.finish();
        }

        return { count: animations.length, samples };
      });

      expect(motion.count).toBe(2);

      expect(motion.samples[0][incoming].y).toBeGreaterThan(40);
      expect(motion.samples[1][incoming].y).toBeGreaterThan(0);
      expect(motion.samples[2][incoming].y).toBeCloseTo(0, 1);
      expect(motion.samples[0][outgoing].y).toBe(0);
      expect(motion.samples[1][outgoing].y).toBeLessThan(0);
      expect(motion.samples[2][outgoing].y).toBeLessThan(-40);
      expect(motion.samples[1][incoming].opacity).toBeGreaterThan(motion.samples[0][incoming].opacity);
      expect(motion.samples[1][outgoing].opacity).toBeLessThan(motion.samples[0][outgoing].opacity);

      await expect(switcher).toHaveAttribute('aria-pressed', String(dark));
    }

    await switcher.click();

    await page.reload();

    await expect(switcher).toBeEnabled();

    await expect(switcher).toHaveAttribute('aria-pressed', 'true');

    const restoredAnimations = await switcher
      .locator('svg')
      .evaluateAll((icons) => icons.flatMap((icon) => icon.getAnimations()).length);

    expect(restoredAnimations).toBe(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const dark of [false, true]) {
      await switcher.click();

      await expect(switcher).toHaveAttribute('aria-pressed', String(dark));

      const animations = await switcher
        .locator('svg')
        .evaluateAll((icons) => icons.flatMap((icon) => icon.getAnimations()).length);

      expect(animations).toBe(0);
    }
  });
}

test('native keyboard activation, system preference and Astro swaps share the same state', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });

  await page.goto('/es/');

  const button = page.getByRole('button', { name: 'Tema oscuro' });

  await expect(button).toHaveAttribute('aria-pressed', 'false');

  await page.emulateMedia({ colorScheme: 'dark' });

  await expect(button).toHaveAttribute('aria-pressed', 'true');

  await button.focus();

  await page.keyboard.press('Enter');

  await expect(button).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('Space');

  await expect(button).toHaveAttribute('aria-pressed', 'true');

  await page.locator('nav a[href="/es/contact/"]').first().click();

  await expect(page).toHaveURL(/\/es\/contact\/$/);

  await expect(button).toHaveAttribute('aria-pressed', 'true');

  await button.focus();

  await page.keyboard.press('Enter');

  await expect(button).toHaveAttribute('aria-pressed', 'false');

  await page.emulateMedia({ colorScheme: 'light' });

  await page.emulateMedia({ colorScheme: 'dark' });

  await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('Astro swaps preserve the active theme before the incoming document is shown', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });

  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    });
    document.addEventListener('astro:after-swap', () => {
      document.documentElement.dataset['themeAtSwap'] = String(document.documentElement.classList.contains('dark'));
    });
  });

  await page.goto('/');

  const switcher = page.locator('[data-theme-switcher]');

  await switcher.click();

  await expect(switcher).toHaveAttribute('aria-pressed', 'true');

  await page.locator('nav a[href="/contact/"]').first().click();

  await expect(page).toHaveURL(/\/contact\/$/);

  await expect(page.locator('html')).toHaveAttribute('data-theme-at-swap', 'true');

  await expect(switcher).toHaveAttribute('aria-pressed', 'true');

  await switcher.click();

  await expect(switcher).toHaveAttribute('aria-pressed', 'false');

  await page.locator('nav a[href="/projects/"]').first().click();

  await expect(page).toHaveURL(/\/projects\/$/);

  await expect(page.locator('html')).toHaveAttribute('data-theme-at-swap', 'false');

  await expect(switcher).toHaveAttribute('aria-pressed', 'false');
});
