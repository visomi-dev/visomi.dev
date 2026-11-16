import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import './page-navigation-loader';

function prepare(load: () => Promise<void>, controller = new AbortController()) {
  const event = Object.assign(new Event('astro:before-preparation', { cancelable: true }), {
    loader: load,
    signal: controller.signal,
  });

  document.dispatchEvent(event);

  return { event, controller };
}

function pendingNavigation() {
  let resolve: () => void = () => undefined;
  const pending = new Promise<void>((done) => {
    resolve = done;
  });
  const { event, controller } = prepare(() => pending);

  return { navigation: event.loader(), resolve, controller };
}

const visible = () => !document.getElementById('page-navigation-loader')?.hasAttribute('hidden');

describe('page navigation loader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.lang = 'en';
    document.body.innerHTML = '<div id="page-navigation-loader" hidden><span role="status"></span></div>';
    window.dispatchEvent(new PageTransitionEvent('pageshow'));
  });

  afterEach(() => {
    window.dispatchEvent(new PageTransitionEvent('pageshow'));
    vi.useRealTimers();
  });

  it('never shows for fast navigation, even after its original show deadline', async () => {
    const current = pendingNavigation();

    await vi.advanceTimersByTimeAsync(399);

    expect(visible()).toBe(false);
    current.resolve();

    await current.navigation;

    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
  });

  it('shows only for a real wait and remains readable without blocking completion', async () => {
    const current = pendingNavigation();

    expect(visible()).toBe(false);

    await vi.advanceTimersByTimeAsync(400);

    expect(visible()).toBe(true);
    expect(document.querySelector('[role="status"]')?.textContent).toBe('Loading page');
    current.resolve();

    await current.navigation;

    await vi.advanceTimersByTimeAsync(249);

    expect(visible()).toBe(true);

    await vi.advanceTimersByTimeAsync(1);

    expect(visible()).toBe(false);
  });

  it('hides immediately after completion when it has already been visible long enough', async () => {
    const current = pendingNavigation();

    await vi.advanceTimersByTimeAsync(1000);

    current.resolve();

    await current.navigation;

    await vi.advanceTimersByTimeAsync(0);

    expect(visible()).toBe(false);
  });

  it.each([0, 400])('clears failed navigation after %i ms and preserves the failure', async (duration) => {
    let reject: (error: Error) => void = () => undefined;
    const pending = new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
    const { event } = prepare(() => pending);
    const navigation = event.loader();
    const rejection = expect(navigation).rejects.toThrow('synthetic navigation failure');

    await vi.advanceTimersByTimeAsync(duration);

    reject(new Error('synthetic navigation failure'));

    await rejection;

    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
  });

  it.each([0, 400])('clears cancellation after %i ms even if the loader never settles', async (duration) => {
    const current = pendingNavigation();

    await vi.advanceTimersByTimeAsync(duration);

    current.controller.abort();

    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
    current.resolve();

    await current.navigation;
  });

  it('does not let an older navigation hide or show over its replacement', async () => {
    const first = pendingNavigation();

    await vi.advanceTimersByTimeAsync(300);

    const second = pendingNavigation();

    first.controller.abort();
    first.resolve();

    await first.navigation;

    await vi.advanceTimersByTimeAsync(399);

    expect(visible()).toBe(false);

    await vi.advanceTimersByTimeAsync(1);

    expect(visible()).toBe(true);
    second.resolve();

    await second.navigation;

    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
  });

  it('keeps a visible bar continuous across consecutive navigations', async () => {
    const first = pendingNavigation();

    await vi.advanceTimersByTimeAsync(400);

    first.resolve();

    await first.navigation;

    await vi.advanceTimersByTimeAsync(100);

    const second = pendingNavigation();

    await vi.advanceTimersByTimeAsync(400);

    expect(visible()).toBe(true);
    second.resolve();

    await second.navigation;

    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
  });

  it('resets timers and ignores old completion after a page is restored', async () => {
    const current = pendingNavigation();

    await vi.advanceTimersByTimeAsync(400);

    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    expect(visible()).toBe(false);
    current.resolve();

    await current.navigation;

    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
  });

  it('does not show for an already aborted or prevented navigation', async () => {
    const controller = new AbortController();

    controller.abort();

    const { event } = prepare(async () => undefined, controller);

    await event.loader();

    const prevented = prepare(async () => undefined).event;

    prevented.preventDefault();

    // ClientRouter does not call the loader when preparation was prevented.
    await vi.runAllTimersAsync();

    expect(visible()).toBe(false);
  });

  it('refreshes the persisted status to the current locale and tolerates a missing node', async () => {
    document.documentElement.lang = 'es';

    const current = pendingNavigation();

    await vi.advanceTimersByTimeAsync(400);

    expect(document.querySelector('[role="status"]')?.textContent).toBe('Cargando página');
    current.resolve();

    await current.navigation;

    await vi.runAllTimersAsync();

    document.body.innerHTML = '';

    const missing = pendingNavigation();

    await vi.advanceTimersByTimeAsync(400);

    missing.resolve();

    await missing.navigation;

    await vi.runAllTimersAsync();

    expect(document.body.children).toHaveLength(0);
  });
});
