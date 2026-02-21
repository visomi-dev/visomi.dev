import { Component, effect, inject, PLATFORM_ID, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { UI } from '../../shared/ui';

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
  protected readonly ui = inject(UI);
  private readonly platformId = inject(PLATFORM_ID);

  readonly container = viewChild<ElementRef<HTMLElement>>('container');

  readonly vertexShader = httpResource.text(() => '/assets/home/background/meteor.vert');
  readonly fragmentShader = httpResource.text(() => '/assets/home/background/meteor.frag');

  readonly initEffect = effect((onCleanup) => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const containerRef = this.container();
    const three = this.ui.three();
    const vertexShader = this.vertexShader.value();
    const fragmentShader = this.fragmentShader.value();

    if (containerRef == null || three == null || vertexShader == null || fragmentShader == null) {
      if (containerRef != null) {
        this.ui.getThree();
      }

      return;
    }

    const container = containerRef.nativeElement;
    const { Scene, OrthographicCamera, WebGLRenderer, ShaderMaterial, Vector2, PlaneGeometry, Mesh } = three;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);

    const material = new ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);

    scene.add(mesh);

    container.insertBefore(renderer.domElement, container.firstChild);

    let frameId: number;

    const animate = () => {
      material.uniforms['iTime'].value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      (material.uniforms['iResolution'].value as InstanceType<typeof Vector2>).set(
        window.innerWidth,
        window.innerHeight,
      );
    };

    window.addEventListener('resize', handleResize);

    onCleanup(() => {
      cancelAnimationFrame(frameId);

      window.removeEventListener('resize', handleResize);

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    });
  });
}
