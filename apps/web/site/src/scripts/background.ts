import * as THREE from 'three';

const basePath = import.meta.env.BASE_URL;
const vertexShaderUrl = `${basePath}assets/home/background/background.vert`;
const fragmentShaderUrl = `${basePath}assets/home/background/background.frag`;
const timeStep = 1 / 60;
const maxPixelRatio = 1.5;

type BackgroundState = {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  material: THREE.ShaderMaterial;
  resolution: THREE.Vector2;
};

type Cleanup = () => void;

let state: BackgroundState | null = null;
let frameId: number | null = null;
let isRunning = false;
const cleanups: Cleanup[] = [];

const stopLoop = () => {
  isRunning = false;
  if (frameId !== null) {
    window.cancelAnimationFrame(frameId);
    frameId = null;
  }
};

const startLoop = () => {
  if (!state || isRunning) {
    return;
  }

  isRunning = true;

  const tick = () => {
    if (!isRunning || !state) {
      return;
    }

    state.material.uniforms.iTime.value += timeStep;
    state.renderer.render(state.scene, state.camera);
    frameId = window.requestAnimationFrame(tick);
  };

  frameId = window.requestAnimationFrame(tick);
};

const syncLoop = (darkBackground: HTMLElement | null) => {
  if (!state) {
    return;
  }

  const shouldRender = !document.hidden && darkBackground !== null && !darkBackground.classList.contains('hidden');

  if (shouldRender) {
    startLoop();
    return;
  }

  stopLoop();
};

const teardown = () => {
  stopLoop();

  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    cleanup?.();
  }

  if (state) {
    state.renderer.dispose();
    state.material.dispose();
    state = null;
  }
};

export const initBackground = async () => {
  if (state) {
    teardown();
  }

  const lightBackground = document.getElementById('light-bg');
  const darkBackground = document.getElementById('dark-bg');

  if (!lightBackground || !darkBackground) {
    return;
  }

  const html = document.documentElement;
  const isDarkOnLoad = html.classList.contains('dark');

  if (isDarkOnLoad) {
    lightBackground.classList.add('hidden');
    darkBackground.classList.remove('hidden');
  } else {
    darkBackground.classList.add('hidden');
    lightBackground.classList.remove('hidden');
  }

  let currentTheme: 'light' | 'dark' = isDarkOnLoad ? 'dark' : 'light';

  const themeObserver = new MutationObserver(() => {
    const isDark = html.classList.contains('dark');
    const nextTheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

    if (nextTheme === currentTheme) {
      return;
    }

    currentTheme = nextTheme;

    if (isDark) {
      lightBackground.classList.remove('bg-upward-enter');
      lightBackground.classList.add('bg-upward-leave');

      darkBackground.classList.remove('hidden', 'bg-upward-leave');
      darkBackground.classList.add('bg-upward-enter');

      window.setTimeout(() => {
        lightBackground.classList.add('hidden');
        syncLoop(darkBackground);
      }, 700);
      return;
    }

    darkBackground.classList.remove('bg-upward-enter');
    darkBackground.classList.add('bg-upward-leave');

    lightBackground.classList.remove('hidden', 'bg-upward-leave');
    lightBackground.classList.add('bg-upward-enter');

    window.setTimeout(() => {
      darkBackground.classList.add('hidden');
      syncLoop(darkBackground);
    }, 700);
  });

  themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
  cleanups.push(() => themeObserver.disconnect());

  try {
    const [vertexShader, fragmentShader] = await Promise.all([
      fetch(vertexShaderUrl).then((response) => response.text()),
      fetch(fragmentShaderUrl).then((response) => response.text()),
    ]);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: resolution },
      },
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.setSize(resolution.x, resolution.y);
    darkBackground.appendChild(renderer.domElement);

    state = { scene, camera, renderer, material, resolution };

    const onResize = () => {
      if (!state) {
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      resolution.set(width, height);
    };

    window.addEventListener('resize', onResize);
    cleanups.push(() => window.removeEventListener('resize', onResize));

    document.addEventListener('visibilitychange', () => syncLoop(darkBackground));
    cleanups.push(() => document.removeEventListener('visibilitychange', () => syncLoop(darkBackground)));

    {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          syncLoop(entry?.isIntersecting ? darkBackground : null);
        },
        { threshold: 0 },
      );
      observer.observe(darkBackground);
      cleanups.push(() => observer.disconnect());
    }

    syncLoop(darkBackground);
  } catch (error) {
    console.error('Failed to initialize 3D background:', error);
    teardown();
  }
};

export const destroyBackground = () => teardown();

document.addEventListener('astro:before-swap', () => teardown());

const start = () => {
  void initBackground();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
