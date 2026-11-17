import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const graphics = vi.hoisted(() => ({ fail: false }));

vi.mock('three', () => {
  class Scene {
    add() {
      return undefined;
    }
  }

  class OrthographicCamera {}

  class Vector2 {
    constructor(
      public x: number,
      public y: number,
    ) {}

    set(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }

  class ShaderMaterial {
    uniforms: { iTime: { value: number }; iResolution: { value: Vector2 } };

    constructor(options: { uniforms: { iTime: { value: number }; iResolution: { value: Vector2 } } }) {
      this.uniforms = options.uniforms;
    }

    dispose() {
      return undefined;
    }
  }

  class PlaneGeometry {
    dispose() {
      return undefined;
    }
  }

  class Mesh {}

  class WebGLRenderer {
    domElement = document.createElement('canvas');

    constructor() {
      if (graphics.fail) {
        throw new Error('synthetic_renderer_failure');
      }
    }

    setSize() {
      return undefined;
    }

    setPixelRatio() {
      return undefined;
    }

    render() {
      return undefined;
    }

    dispose() {
      return undefined;
    }
  }

  return {
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    ShaderMaterial,
    Vector2,
    WebGLRenderer,
  };
});

import { initBackground, __resetBackgroundForTesting } from './background';

describe('initBackground', () => {
  beforeEach(() => {
    __resetBackgroundForTesting();
    graphics.fail = false;
    document.documentElement.style.setProperty('--ui-theme-duration-ms', '400');
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as ReturnType<HTMLCanvasElement['getContext']>,
    );
  });
  afterEach(() => {
    __resetBackgroundForTesting();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps the static background usable when WebGL is unavailable', async () => {
    document.body.innerHTML = '<div id="light-bg"></div><div id="dark-bg"></div>';
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;

    await expect(initBackground()).resolves.toBeUndefined();

    expect(document.querySelector('canvas')).toBeNull();
  });
  it('cancels stale theme cleanup and honors reduced motion even without WebGL', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="light-bg"></div><div id="dark-bg"></div>';
    document.documentElement.classList.remove('dark');
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') });
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

    await initBackground();

    document.documentElement.classList.add('dark');

    await Promise.resolve();

    vi.advanceTimersByTime(200);
    document.documentElement.classList.remove('dark');

    await Promise.resolve();

    vi.advanceTimersByTime(200);
    expect(document.getElementById('light-bg')?.classList.contains('hidden')).toBe(false);
    vi.advanceTimersByTime(200);
    expect(document.getElementById('dark-bg')?.classList.contains('hidden')).toBe(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    document.documentElement.classList.add('dark');

    await Promise.resolve();

    expect(document.getElementById('light-bg')?.classList.contains('hidden')).toBe(true);
    expect(document.getElementById('dark-bg')?.classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.bg-upward-enter, .bg-upward-leave')).toBeNull();
    vi.useRealTimers();
  });

  it('renders a static shader for reduced motion and responds to preference changes', async () => {
    document.body.innerHTML = '<div id="light-bg"></div><div id="dark-bg"></div>';
    document.documentElement.classList.add('dark');
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') });
    const motion = Object.assign(new EventTarget(), { matches: true });

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(motion));
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    vi.spyOn(window, 'cancelAnimationFrame');

    await initBackground();

    expect(document.querySelector('#dark-bg canvas')).not.toBeNull();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    motion.matches = false;
    motion.dispatchEvent(new Event('change'));
    expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
    motion.matches = true;
    motion.dispatchEvent(new Event('change'));
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('releases the background when renderer initialization fails after acquiring a context', async () => {
    document.body.innerHTML = '<div id="light-bg"></div><div id="dark-bg"></div>';
    graphics.fail = true;
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;

    await expect(initBackground()).resolves.toBeUndefined();

    expect(document.querySelector('canvas')).toBeNull();
  });

  it('renders frames while visible, pauses offscreen and transitions back to the light theme', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="light-bg"></div><div id="dark-bg"></div>';
    document.documentElement.classList.add('dark');
    vi.stubGlobal('devicePixelRatio', 0);
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;
    let frame: FrameRequestCallback = () => undefined;

    window.requestAnimationFrame = vi.fn((callback) => {
      frame = callback;

      return 1;
    });
    window.cancelAnimationFrame = vi.fn();

    await initBackground();

    frame(0);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    document.documentElement.classList.remove('dark');

    await Promise.resolve();

    vi.advanceTimersByTime(400);
    expect(document.getElementById('dark-bg')?.classList.contains('hidden')).toBe(true);
    __resetBackgroundForTesting();
    frame(1);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('initializes the background renderer and responds to theme changes', async () => {
    vi.useFakeTimers();

    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    document.documentElement.classList.remove('dark');
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;
    window.requestAnimationFrame = vi.fn().mockImplementation(() => 1);

    await initBackground();

    const lightBackground = document.getElementById('light-bg');
    const darkBackground = document.getElementById('dark-bg');

    expect(lightBackground?.classList.contains('hidden')).toBe(false);
    expect(darkBackground?.querySelector('canvas')).not.toBeNull();

    document.documentElement.classList.add('dark');

    await Promise.resolve();

    vi.advanceTimersByTime(400);

    expect(lightBackground?.classList.contains('hidden')).toBe(true);
    expect(darkBackground?.classList.contains('hidden')).toBe(false);

    vi.useRealTimers();
  });

  it('returns early when the background containers are missing', async () => {
    document.body.innerHTML = '';

    await expect(initBackground()).resolves.toBeUndefined();
  });

  it('handles shader loading failures without throwing', async () => {
    const { __resetBackgroundForTesting } = await import('./background');

    __resetBackgroundForTesting();

    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network')) as typeof fetch;
    window.requestAnimationFrame = vi.fn().mockImplementation(() => 1);

    await initBackground();

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('initializes the IntersectionObserver and visibilitychange listener', async () => {
    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    document.documentElement.classList.remove('dark');
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;
    window.requestAnimationFrame = vi.fn().mockImplementation(() => 1);

    const observeSpy = vi.spyOn(globalThis.IntersectionObserver.prototype, 'observe');

    await initBackground();

    expect(observeSpy).toHaveBeenCalled();
  });

  it('cleans up on astro:before-swap and responds to destroyBackground', async () => {
    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    document.documentElement.classList.add('dark');
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;
    window.requestAnimationFrame = vi.fn().mockImplementation(() => 1);

    await initBackground();

    const { destroyBackground } = await import('./background');

    expect(() => destroyBackground()).not.toThrow();
  });

  it('updates resolution on window resize', async () => {
    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    document.documentElement.classList.add('dark');
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;
    window.requestAnimationFrame = vi.fn().mockImplementation(() => 1);

    await initBackground();

    expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
  });

  it('invokes IntersectionObserver callback on visibility change', async () => {
    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    document.documentElement.classList.add('dark');
    globalThis.fetch = vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('shader') }) as typeof fetch;
    window.requestAnimationFrame = vi.fn().mockImplementation(() => 1);

    await initBackground();

    const { __MockIntersectionObserver } = globalThis as unknown as {
      __MockIntersectionObserver: { lastCallback: IntersectionObserverCallback | null };
    };

    expect(__MockIntersectionObserver.lastCallback).not.toBeNull();

    __MockIntersectionObserver.lastCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });

  it('registers DOMContentLoaded listener when document is still loading', async () => {
    const originalReadyState = document.readyState;

    Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });

    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    vi.resetModules();

    await import('./background');

    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function), expect.anything());

    addEventListenerSpy.mockRestore();
    Object.defineProperty(document, 'readyState', { configurable: true, value: originalReadyState });
  });
});
