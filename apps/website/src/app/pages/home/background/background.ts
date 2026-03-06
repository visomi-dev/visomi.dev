import { Component, effect, inject, PLATFORM_ID, viewChild, type ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { httpResource } from '@angular/common/http';

import { Deps } from '../../../shared/deps';
import { Settings } from '../../../shared/settings';

const VERTEX_SHADER_URL = '/assets/home/background/background.vert';
const FRAGMENT_SHADER_URL = '/assets/home/background/background.frag';
const TIME_STEP = 1 / 60;

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

  readonly container = viewChild<ElementRef<HTMLElement>>('container');
  readonly vertexShader = httpResource.text(() => VERTEX_SHADER_URL);
  readonly fragmentShader = httpResource.text(() => FRAGMENT_SHADER_URL);

  readonly initEffect = effect((onCleanup) => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const containerRef = this.container();
    const three = this.deps.three();
    const vert = this.vertexShader.value();
    const frag = this.fragmentShader.value();

    if (containerRef == null || three == null || vert == null || frag == null) {
      if (containerRef != null) {
        this.deps.getThree();
      }

      return;
    }

    const container = containerRef.nativeElement;
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

    container.insertBefore(renderer.domElement, container.firstChild);

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

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    });
  });
}
