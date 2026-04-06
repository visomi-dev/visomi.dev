import { describe, expect, it, vi } from 'vitest';

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
  }

  class PlaneGeometry {}
  class Mesh {}

  class WebGLRenderer {
    domElement = document.createElement('canvas');

    setSize() {
      return undefined;
    }

    render() {
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

import { initBackground } from './background';

describe('initBackground', () => {
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
    vi.advanceTimersByTime(700);

    expect(lightBackground?.classList.contains('hidden')).toBe(true);
    expect(darkBackground?.classList.contains('hidden')).toBe(false);

    vi.useRealTimers();
  });

  it('returns early when the background containers are missing', async () => {
    document.body.innerHTML = '';

    await expect(initBackground()).resolves.toBeUndefined();
  });

  it('handles shader loading failures without throwing', async () => {
    document.body.innerHTML = `
      <div id="light-bg"></div>
      <div id="dark-bg"></div>
    `;

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network')) as typeof fetch;
    await initBackground();

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
