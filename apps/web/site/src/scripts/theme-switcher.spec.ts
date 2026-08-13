import { describe, expect, it, vi } from 'vitest';

import { initThemeSwitcher } from './theme-switcher';

const createSwitcherMarkup = () => `
  <label class="theme-switch-label">
    <input class="theme-switch-input" type="checkbox" />
    <span class="theme-icon-light"></span>
    <span class="theme-icon-dark hidden"></span>
  </label>
  <label class="theme-switch-label">
    <input class="theme-switch-input" type="checkbox" />
    <span class="theme-icon-light"></span>
    <span class="theme-icon-dark hidden"></span>
  </label>
`;

describe('initThemeSwitcher', () => {
  it('applies the stored theme and toggles all controls', () => {
    vi.useFakeTimers();

    document.body.innerHTML = createSwitcherMarkup();
    localStorage.setItem('theme', 'dark');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    initThemeSwitcher();

    const labels = document.querySelectorAll<HTMLElement>('.theme-switch-label');
    const inputs = document.querySelectorAll<HTMLInputElement>('.theme-switch-input');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(inputs[0]?.checked).toBe(true);
    expect(inputs[1]?.checked).toBe(true);

    labels[0]?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
    vi.advanceTimersByTime(350);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');

    labels[1]?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ' }));
    vi.advanceTimersByTime(350);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    vi.useRealTimers();
  });

  it('falls back to light theme and ignores incomplete switchers', () => {
    document.body.innerHTML = `
      <label class="theme-switch-label">
        <input class="theme-switch-input" type="checkbox" />
        <span class="theme-icon-light"></span>
        <span class="theme-icon-dark hidden"></span>
      </label>
      <label class="theme-switch-label">
        <span class="theme-icon-light"></span>
      </label>
    `;
    localStorage.removeItem('theme');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;
    document.documentElement.classList.remove('dark');

    initThemeSwitcher();

    const label = document.querySelector<HTMLElement>('.theme-switch-label');

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    label?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
