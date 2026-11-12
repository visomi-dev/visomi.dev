import { beforeEach, describe, expect, it, vi } from 'vitest';

import './page-navigation-loader';

describe('page navigation loader', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="page-navigation-loader" class="hidden"></div>';
  });

  it('stays visible while ClientRouter loads a destination and hides after completion', async () => {
    let finish: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const event = Object.assign(new Event('astro:before-preparation'), { loader: vi.fn(() => pending) });

    document.dispatchEvent(event);

    const loader = document.getElementById('page-navigation-loader');
    const navigation = event.loader();

    expect(loader?.classList.contains('hidden')).toBe(false);
    finish();

    await navigation;

    expect(loader?.classList.contains('hidden')).toBe(true);
  });

  it('hides when loading fails instead of leaving a permanent indicator', async () => {
    const event = Object.assign(new Event('astro:before-preparation'), {
      loader: vi.fn(async () => {
        throw new Error('synthetic navigation failure');
      }),
    });

    document.dispatchEvent(event);

    await expect(event.loader()).rejects.toThrow('synthetic navigation failure');

    expect(document.getElementById('page-navigation-loader')?.classList.contains('hidden')).toBe(true);
  });

  it('clears a restored page and allows navigation without a loader element', async () => {
    document.getElementById('page-navigation-loader')?.classList.remove('hidden');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    expect(document.getElementById('page-navigation-loader')?.classList.contains('hidden')).toBe(true);

    document.body.innerHTML = '';

    const load = vi.fn(async () => undefined);
    const event = Object.assign(new Event('astro:before-preparation'), { loader: load });

    document.dispatchEvent(event);

    await event.loader();

    expect(load).toHaveBeenCalledOnce();
  });
});
