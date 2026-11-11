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
  darkBackground: HTMLElement;
};

type Cleanup = () => void;

let state: BackgroundState | null = null;
let frameId: number | null = null;
let isRunning = false;
const cleanups: Cleanup[] = [];
let vertexShaderText: string | null = null;
let fragmentShaderText: string | null = null;

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

const syncLoop = () => {
  if (!state) {
    return;
  }

  const shouldRender = !document.hidden && !state.darkBackground.classList.contains('hidden');

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

const loadShaders = async (): Promise<[string, string] | null> => {
  if (vertexShaderText !== null && fragmentShaderText !== null) {
    return [vertexShaderText, fragmentShaderText];
  }

  try {
    const [vertex, fragment] = await Promise.all([
      fetch(vertexShaderUrl).then((response) => response.text()),
      fetch(fragmentShaderUrl).then((response) => response.text()),
    ]);

    vertexShaderText = vertex;
    fragmentShaderText = fragment;

    return [vertex, fragment];
  } catch (error) {
    console.error('Failed to load background shaders:', error);
    return null;
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

  const themeObserver = new MutationObserver(() => {
    if (!state) {
      return;
    }

    const isDark = html.classList.contains('dark');

    if (isDark) {
      lightBackground.classList.remove('bg-upward-enter');
      lightBackground.classList.add('bg-upward-leave');

      darkBackground.classList.remove('hidden', 'bg-upward-leave');
      darkBackground.classList.add('bg-upward-enter');

      window.setTimeout(() => {
        lightBackground.classList.add('hidden');
        syncLoop();
      }, 700);
      return;
    }

    darkBackground.classList.remove('bg-upward-enter');
    darkBackground.classList.add('bg-upward-leave');

    lightBackground.classList.remove('hidden', 'bg-upward-leave');
    lightBackground.classList.add('bg-upward-enter');

    window.setTimeout(() => {
      darkBackground.classList.add('hidden');
      syncLoop();
    }, 700);
  });

  themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
  cleanups.push(() => themeObserver.disconnect());

  const shaders = await loadShaders();

  if (!shaders) {
    return;
  }

  const [vertexShader, fragmentShader] = shaders;

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

  state = { scene, camera, renderer, material, resolution, darkBackground };

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

  const onVisibilityChange = () => syncLoop();

  document.addEventListener('visibilitychange', onVisibilityChange);
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry?.isIntersecting === false) {
        stopLoop();
        return;
      }

      syncLoop();
    },
    { threshold: 0 },
  );
  io.observe(darkBackground);
  cleanups.push(() => io.disconnect());

  syncLoop();
};

export const destroyBackground = () => teardown();

export const __resetBackgroundForTesting = () => {
  teardown();
  vertexShaderText = null;
  fragmentShaderText = null;
};

const start = () => {
  void initBackground();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

document.addEventListener('astro:before-swap', teardown);
document.addEventListener('astro:page-load', start);
