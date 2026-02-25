import { Component, ElementRef, ViewChild, OnDestroy, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-starfield',
  standalone: true,
  template: `<canvas #canvas class="fixed inset-0 z-0 pointer-events-none opacity-80"></canvas>`,
})
export class StarfieldComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private animationFrameId: number = 0;
  private resizeListener?: () => void;

  constructor() {
    afterNextRender(() => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      const stars: {x: number, y: number, size: number, opacity: number, speed: number, minOpacity: number, maxOpacity: number}[] = [];
      const numStars = Math.floor((width * height) / 1200);

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() > 0.9 ? 2 : 1,
          opacity: Math.random(),
          speed: (Math.random() * 0.005) + 0.001,
          minOpacity: Math.random() * 0.2,
          maxOpacity: Math.random() * 0.6 + 0.4
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        stars.forEach(star => {
          // Twinkle effect
          star.opacity += star.speed;
          if (star.opacity >= star.maxOpacity || star.opacity <= star.minOpacity) {
            star.speed *= -1;
          }

          const currentOpacity = Math.max(0, Math.min(1, star.opacity));

          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
        });

        this.animationFrameId = requestAnimationFrame(animate);
      };

      this.resizeListener = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      };

      window.addEventListener('resize', this.resizeListener);
      animate();
    });
  }

  ngOnDestroy() {
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeListener && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
}
