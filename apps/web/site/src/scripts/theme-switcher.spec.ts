import { afterEach, describe, expect, it, vi } from 'vitest';

import { initThemeSwitcher } from './theme-switcher';

const createSwitcherMarkup = () => `
  <button data-theme-switcher disabled>
    <span class="theme-icon-light"></span>
    <span class="theme-icon-dark hidden"></span>
  </button>
  <button data-theme-switcher disabled>
    <span class="theme-icon-light"></span>
    <span class="theme-icon-dark hidden"></span>
  </button>
`;

describe('initThemeSwitcher', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  it('applies the stored theme and toggles all controls', () => {
    vi.useFakeTimers();

    document.body.innerHTML = createSwitcherMarkup();
    localStorage.setItem('theme', 'dark');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    initThemeSwitcher();

    const labels = document.querySelectorAll<HTMLButtonElement>('button[data-theme-switcher]');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(labels[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(labels[1]?.getAttribute('aria-pressed')).toBe('true');

    labels[0]?.click();
    vi.advanceTimersByTime(450);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');

    labels[1]?.click();
    vi.advanceTimersByTime(450);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    vi.useRealTimers();
  });

  it('falls back to light theme and ignores non-button markup', () => {
    document.body.innerHTML = `
      <button data-theme-switcher disabled>
        <span class="theme-icon-light"></span>
        <span class="theme-icon-dark hidden"></span>
      </button>
      <span class="theme-switch-label">
        <span class="theme-icon-light"></span>
      </span>
    `;
    localStorage.removeItem('theme');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;
    document.documentElement.classList.remove('dark');

    initThemeSwitcher();

    const label = document.querySelector<HTMLButtonElement>('button[data-theme-switcher]');

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    label?.click();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('re-applies the stored theme and re-attaches handlers on astro:page-load', () => {
    vi.useFakeTimers();

    document.body.innerHTML = createSwitcherMarkup();
    localStorage.setItem('theme', 'light');
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia;
    document.documentElement.classList.add('dark');

    initThemeSwitcher();

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    document.body.innerHTML = createSwitcherMarkup();

    document.dispatchEvent(new Event('astro:page-load'));
    vi.advanceTimersByTime(0);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const newLabel = document.querySelector<HTMLButtonElement>('button[data-theme-switcher]');

    newLabel?.click();
    vi.advanceTimersByTime(450);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    vi.useRealTimers();
  });

  it('starts icons and page together, renews the clock on rapid toggles and cleans it up', () => {
    vi.useFakeTimers();
    document.body.innerHTML = createSwitcherMarkup();
    localStorage.setItem('theme', 'light');
    document.documentElement.style.setProperty('--ui-theme-duration-ms', '400');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    initThemeSwitcher();

    const controls = document.querySelectorAll<HTMLButtonElement>('button[data-theme-switcher]');

    expect(document.querySelector('[data-theme-animated]')).toBeNull();
    controls[0]?.click();
    document.dispatchEvent(new Event('astro:page-load'));
    expect(document.documentElement.dataset['themeTransition']).toBe('');
    expect([...controls].every((control) => control.hasAttribute('data-theme-animated'))).toBe(true);
    expect([...controls].every((control) => control.getAttribute('aria-pressed') === 'true')).toBe(true);
    vi.advanceTimersByTime(200);
    controls[1]?.click();
    vi.advanceTimersByTime(220);
    expect(document.documentElement.hasAttribute('data-theme-transition')).toBe(true);
    vi.advanceTimersByTime(200);
    expect(document.documentElement.hasAttribute('data-theme-transition')).toBe(false);
    expect(document.querySelector('[data-theme-animated]')).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('remains usable with blocked persistence and applies cross-tab preferences', () => {
    document.body.innerHTML = createSwitcherMarkup();
    localStorage.setItem('theme', 'light');
    initThemeSwitcher();

    const write = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    document.querySelector<HTMLButtonElement>('button[data-theme-switcher]')?.click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    write.mockRestore();
    localStorage.setItem('theme', 'light');
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('uses the system for invalid preferences and suppresses reduced motion', () => {
    document.body.innerHTML = createSwitcherMarkup();
    localStorage.setItem('theme', 'invalid');
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    initThemeSwitcher();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    document.querySelector<HTMLButtonElement>('button[data-theme-switcher]')?.click();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.querySelector('[data-theme-animated]')).toBeNull();
    expect(document.documentElement.hasAttribute('data-theme-transition')).toBe(false);
  });
});
