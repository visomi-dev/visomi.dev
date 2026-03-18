import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const VERTEX_SHADER_URL = '/assets/home/background/background.vert';
const FRAGMENT_SHADER_URL = '/assets/home/background/background.frag';
const TIME_STEP = 1 / 60;

let scene, camera, renderer, material, geometry, mesh;
let isThreeInitialized = false;

async function initBackground() {
  const lightBg = document.getElementById('light-bg');
  const darkBg = document.getElementById('dark-bg');
  if (!lightBg || !darkBg) return;

  const html = document.documentElement;

  // Toggle visibility based on theme
  function updateBackgroundVisibility(isInitialLoad = false) {
    const isDark = html.classList.contains('dark');

    if (isDark) {
      if (!isInitialLoad) {
        lightBg.classList.remove('bg-upward-enter');
        lightBg.classList.add('bg-upward-leave');

        darkBg.classList.remove('hidden');
        darkBg.classList.remove('bg-upward-leave');
        darkBg.classList.add('bg-upward-enter');

        setTimeout(() => {
          lightBg.classList.add('hidden');
        }, 700);
      } else {
        lightBg.classList.add('hidden');
        darkBg.classList.remove('hidden');
        darkBg.classList.add('bg-upward-enter');
      }
    } else {
      if (!isInitialLoad) {
        darkBg.classList.remove('bg-upward-enter');
        darkBg.classList.add('bg-upward-leave');

        lightBg.classList.remove('hidden');
        lightBg.classList.remove('bg-upward-leave');
        lightBg.classList.add('bg-upward-enter');

        setTimeout(() => {
          darkBg.classList.add('hidden');
        }, 700);
      } else {
        darkBg.classList.add('hidden');
        lightBg.classList.remove('hidden');
        lightBg.classList.add('bg-upward-enter');
      }
    }
  }

  updateBackgroundVisibility(true);

  // Observe theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateBackgroundVisibility(false);
      }
    });
  });
  observer.observe(html, { attributes: true });

  // Initialize Three.js for dark mode
  try {
    const [vert, frag] = await Promise.all([
      fetch(VERTEX_SHADER_URL).then((r) => r.text()),
      fetch(FRAGMENT_SHADER_URL).then((r) => r.text()),
    ]);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: resolution },
      },
      vertexShader: vert,
      fragmentShader: frag,
    });

    geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
    renderer.setSize(resolution.x, resolution.y);
    darkBg.appendChild(renderer.domElement);

    const animate = () => {
      material.uniforms.iTime.value += TIME_STEP;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();
    isThreeInitialized = true;

    const onResize = () => {
      if (!isThreeInitialized) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w, h);
    };

    window.addEventListener('resize', onResize);
  } catch (error) {
    console.error('Failed to initialize 3D background:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackground);
} else {
  initBackground();
}
