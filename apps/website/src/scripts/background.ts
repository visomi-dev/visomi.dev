import * as THREE from 'three';

const basePath = import.meta.env.BASE_URL;
const vertexShaderUrl = `${basePath}assets/home/background/background.vert`;
const fragmentShaderUrl = `${basePath}assets/home/background/background.frag`;
const timeStep = 1 / 60;

let renderer: THREE.WebGLRenderer | undefined;
let material: THREE.ShaderMaterial | undefined;

const initBackground = async () => {
  const lightBackground = document.getElementById('light-bg');
  const darkBackground = document.getElementById('dark-bg');

  if (!lightBackground || !darkBackground) {
    return;
  }

  const html = document.documentElement;
  const isDarkOnLoad = html.classList.contains('dark');

  lightBackground.classList.toggle('hidden', isDarkOnLoad);
  darkBackground.classList.toggle('hidden', !isDarkOnLoad);

  let currentTheme: 'light' | 'dark' = isDarkOnLoad ? 'dark' : 'light';

  const observer = new MutationObserver(() => {
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
      }, 700);
      return;
    }

    darkBackground.classList.remove('bg-upward-enter');
    darkBackground.classList.add('bg-upward-leave');

    lightBackground.classList.remove('hidden', 'bg-upward-leave');
    lightBackground.classList.add('bg-upward-enter');

    window.setTimeout(() => {
      darkBackground.classList.add('hidden');
    }, 700);
  });

  observer.observe(html, { attributes: true, attributeFilter: ['class'] });

  try {
    const [vertexShader, fragmentShader] = await Promise.all([
      fetch(vertexShaderUrl).then((response) => response.text()),
      fetch(fragmentShaderUrl).then((response) => response.text()),
    ]);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    material = new THREE.ShaderMaterial({
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

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(resolution.x, resolution.y);
    darkBackground.appendChild(renderer.domElement);

    const animate = () => {
      if (material) {
        material.uniforms.iTime.value += timeStep;
      }
      renderer?.render(scene, camera);
      window.requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer?.setSize(width, height);
      material?.uniforms.iResolution.value.set(width, height);
    });
  } catch (error) {
    console.error('Failed to initialize 3D background:', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void initBackground();
  });
} else {
  void initBackground();
}
