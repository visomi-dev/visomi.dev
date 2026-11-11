import { describe, expect, it, vi } from 'vitest';

import { initPageNavigationLoader } from './page-navigation-loader';

describe('initPageNavigationLoader', () => {
  it('shows the loader for internal navigation and hides it on bfcache restore', () => {
    vi.useFakeTimers();

    document.body.innerHTML = `
      <div id="page-navigation-loader" class="hidden"></div>
      <a id="internal-link" href="/next">Next</a>
      <a id="mailto-link" href="mailto:test@example.com">Mail</a>
    `;

    window.history.replaceState({}, '', '/current');
    initPageNavigationLoader();

    document.getElementById('internal-link')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const loader = document.getElementById('page-navigation-loader');

    expect(loader?.classList.contains('hidden')).toBe(false);
    expect(loader?.classList.contains('in-out-enter')).toBe(true);

    document.getElementById('mailto-link')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(loader?.classList.contains('in-out-enter')).toBe(true);

    const pageShowEvent = new PageTransitionEvent('pageshow', { persisted: true });

    window.dispatchEvent(pageShowEvent);
    vi.advanceTimersByTime(400);

    expect(loader?.classList.contains('hidden')).toBe(true);

    vi.useRealTimers();
  });

  it('ignores non-navigation clicks and non-persisted page restores', () => {
    vi.useFakeTimers();

    document.body.innerHTML = `
      <div id="page-navigation-loader" class="hidden"></div>
      <a id="hash-link" href="#section">Hash</a>
      <a id="target-link" href="/next" target="_blank">Target</a>
      <a id="same-path-link" href="/current">Same path</a>
    `;

    window.history.replaceState({}, '', '/current');
    initPageNavigationLoader();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.getElementById('hash-link')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.getElementById('target-link')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.getElementById('same-path-link')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const loader = document.getElementById('page-navigation-loader');

    expect(loader?.classList.contains('hidden')).toBe(true);

    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
    vi.advanceTimersByTime(400);

    expect(loader?.classList.contains('hidden')).toBe(true);

    vi.useRealTimers();
  });
});
