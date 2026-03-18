import { isPlatformBrowser } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, effect, inject, PLATFORM_ID, viewChild, type ElementRef } from '@angular/core';

import { Deps } from '../../../shared/deps';
import { Settings } from '../../../shared/settings';

const VERTEX_SHADER_URL = '/assets/home/background/background.vert';
const FRAGMENT_SHADER_URL = '/assets/home/background/background.frag';
const TIME_STEP = 1 / 60;
type BackgroundTheme = 'light' | 'dark';

@Component({
  selector: 'app-background',
  imports: [],
  templateUrl: './background.html',
  styleUrl: './background.css',
  host: {
    class: /* tw */ 'block',
  },
})
export class Background {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deps = inject(Deps);
  private readonly settings = inject(Settings);
  private currentTheme: BackgroundTheme | null = null;

  readonly isDarkTheme = this.settings.isDarkTheme;

  readonly lightBackground = viewChild<ElementRef<HTMLElement>>('lightBackground');
  readonly darkBackground = viewChild<ElementRef<HTMLElement>>('darkBackground');
  readonly vertexShader = httpResource.text(() => VERTEX_SHADER_URL);
  readonly fragmentShader = httpResource.text(() => FRAGMENT_SHADER_URL);

  readonly syncThemeEffect = effect((onCleanup) => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const lightBackgroundRef = this.lightBackground();
    const darkBackgroundRef = this.darkBackground();

    if (lightBackgroundRef == null || darkBackgroundRef == null) {
      return;
    }

    const lightBackground = lightBackgroundRef.nativeElement;
    const darkBackground = darkBackgroundRef.nativeElement;
    const nextTheme: BackgroundTheme = this.isDarkTheme() ? 'dark' : 'light';
    let timeoutId: number | undefined;

    if (this.currentTheme == null) {
      this.setStaticBackgroundState(lightBackground, darkBackground, nextTheme);
      this.currentTheme = nextTheme;
      return;
    }

    if (this.currentTheme === nextTheme) {
      return;
    }

    this.currentTheme = nextTheme;

    if (nextTheme === 'dark') {
      lightBackground.classList.remove('bg-upward-enter');
      lightBackground.classList.add('bg-upward-leave');

      darkBackground.classList.remove('hidden', 'bg-upward-leave');
      darkBackground.classList.add('bg-upward-enter');

      timeoutId = window.setTimeout(() => {
        lightBackground.classList.add('hidden');
      }, 700);
    } else {
      darkBackground.classList.remove('bg-upward-enter');
      darkBackground.classList.add('bg-upward-leave');

      lightBackground.classList.remove('hidden', 'bg-upward-leave');
      lightBackground.classList.add('bg-upward-enter');

      timeoutId = window.setTimeout(() => {
        darkBackground.classList.add('hidden');
      }, 700);
    }

    onCleanup(() => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    });
  });

  readonly initEffect = effect((onCleanup) => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const darkBackgroundRef = this.darkBackground();
    const three = this.deps.three();
    const vert = this.vertexShader.value();
    const frag = this.fragmentShader.value();

    if (darkBackgroundRef == null || three == null || vert == null || frag == null) {
      if (darkBackgroundRef != null) {
        this.deps.getThree();
      }

      return;
    }

    const darkBackground = darkBackgroundRef.nativeElement;
    const { Scene, OrthographicCamera, WebGLRenderer, ShaderMaterial, Vector2, PlaneGeometry, Mesh } = three;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new WebGLRenderer({ antialias: true });
    const resolution = new Vector2(window.innerWidth, window.innerHeight);

    const material = new ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: resolution },
      },
      vertexShader: vert,
      fragmentShader: frag,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);

    scene.add(mesh);

    renderer.setSize(resolution.x, resolution.y);

    darkBackground.insertBefore(renderer.domElement, darkBackground.firstChild);

    let frameId: number;

    const animate = () => {
      (material.uniforms['iTime'] as { value: number }).value += TIME_STEP;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      renderer.setSize(w, h);
      resolution.set(w, h);
    };

    window.addEventListener('resize', onResize);

    onCleanup(() => {
      cancelAnimationFrame(frameId);

      window.removeEventListener('resize', onResize);

      if (renderer.domElement.parentNode === darkBackground) {
        darkBackground.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    });
  });

  private setStaticBackgroundState(lightBackground: HTMLElement, darkBackground: HTMLElement, theme: BackgroundTheme) {
    lightBackground.classList.remove('bg-upward-enter', 'bg-upward-leave');
    darkBackground.classList.remove('bg-upward-enter', 'bg-upward-leave');

    if (theme === 'dark') {
      lightBackground.classList.add('hidden');
      darkBackground.classList.remove('hidden');
      return;
    }

    darkBackground.classList.add('hidden');
    lightBackground.classList.remove('hidden');
  }
}
