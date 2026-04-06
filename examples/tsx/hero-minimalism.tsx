'use client';

import React, { useEffect, useRef } from 'react';

export default function MinimalHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type Particle = {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      fadeDelay: number;
      fadeStart: number;
      fadingOut: boolean;
    };

    let particles: Particle[] = [];
    let raf = 0;

    const count = () => Math.floor((canvas.width * canvas.height) / 7000);

    const make = (): Particle => {
      const fadeDelay = Math.random() * 600 + 100;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() / 5 + 0.1,
        opacity: 0.7,
        fadeDelay,
        fadeStart: Date.now() + fadeDelay,
        fadingOut: false,
      };
    };

    const reset = (p: Particle) => {
      p.x = Math.random() * canvas.width;
      p.y = Math.random() * canvas.height;
      p.speed = Math.random() / 5 + 0.1;
      p.opacity = 0.7;
      p.fadeDelay = Math.random() * 600 + 100;
      p.fadeStart = Date.now() + p.fadeDelay;
      p.fadingOut = false;
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < count(); i++) particles.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) reset(p);
        if (!p.fadingOut && Date.now() > p.fadeStart) p.fadingOut = true;
        if (p.fadingOut) {
          p.opacity -= 0.008;
          if (p.opacity <= 0) reset(p);
        }
        ctx.fillStyle = `rgba(250, 250, 250, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, 0.6, Math.random() * 2 + 1);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener('resize', onResize);
    init();
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="fixed inset-0 box-border h-screen w-screen overflow-hidden bg-[#0a0a0a] text-[#fafafa] antialiased *:box-border"
      style={{
        fontFamily:
          "'Hubot Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif",
        textRendering: 'optimizeLegibility',
      }}
    >
      <link href="https://fonts.cdnfonts.com/css/hubot-sans" rel="stylesheet" />
      <style>{`
@keyframes drawX {
  0% { transform: scaleX(0); opacity: 0; }
  60% { opacity: .9; }
  100% { transform: scaleX(1); opacity: .75; }
}
@keyframes drawY {
  0% { transform: scaleY(0); opacity: 0; }
  60% { opacity: .9; }
  100% { transform: scaleY(1); opacity: .75; }
}
@keyframes shimmer {
  0% { opacity: 0; }
  30% { opacity: .25; }
  100% { opacity: 0; }
}
.accent-lines > *::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(250,250,250,.25), transparent);
  opacity: 0;
  animation: shimmer 900ms ease-out forwards;
}
.accent-lines > :nth-child(1)::after { animation-delay: 150ms; }
.accent-lines > :nth-child(2)::after { animation-delay: 280ms; }
.accent-lines > :nth-child(3)::after { animation-delay: 410ms; }
.accent-lines > :nth-child(4)::after { animation-delay: 520ms; }
.accent-lines > :nth-child(5)::after { animation-delay: 640ms; }
.accent-lines > :nth-child(6)::after { animation-delay: 760ms; }
      `}</style>

      {/* Header */}
      <header className="absolute top-0 right-0 left-0 flex items-center justify-between border-b border-[#27272a] px-6 py-5">
        <a
          className="text-sm tracking-[0.06em] text-[#a1a1aa] uppercase no-underline"
          href="https://codepen.io/RAFA3L"
          target="_blank"
          rel="noopener noreferrer"
        >
          NOVA
        </a>
        <button
          type="button"
          onClick={() => alert("We'll get back to you soon.")}
          className="h-9 rounded-[10px] border border-[#27272a] bg-[#111] px-[14px] text-[13px] leading-9 text-[#fafafa] hover:bg-[#0d0d0d]"
        >
          Contact
        </button>
      </header>

      {/* Particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60 mix-blend-screen"
      />

      {/* Accent Lines (animated on mount) */}
      <div className="accent-lines pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] right-0 left-0 h-px origin-center scale-x-0 animate-[drawX_800ms_cubic-bezier(.22,.61,.36,1)_forwards] bg-[#27272a] opacity-75 will-change-[transform,opacity] [animation-delay:150ms]" />
        <div className="absolute top-[50%] right-0 left-0 h-px origin-center scale-x-0 animate-[drawX_800ms_cubic-bezier(.22,.61,.36,1)_forwards] bg-[#27272a] opacity-75 will-change-[transform,opacity] [animation-delay:280ms]" />
        <div className="absolute top-[80%] right-0 left-0 h-px origin-center scale-x-0 animate-[drawX_800ms_cubic-bezier(.22,.61,.36,1)_forwards] bg-[#27272a] opacity-75 will-change-[transform,opacity] [animation-delay:410ms]" />
        <div className="absolute top-0 bottom-0 left-[20%] w-px origin-top scale-y-0 animate-[drawY_900ms_cubic-bezier(.22,.61,.36,1)_forwards] bg-[#27272a] opacity-75 will-change-[transform,opacity] [animation-delay:520ms]" />
        <div className="absolute top-0 bottom-0 left-[50%] w-px origin-top scale-y-0 animate-[drawY_900ms_cubic-bezier(.22,.61,.36,1)_forwards] bg-[#27272a] opacity-75 will-change-[transform,opacity] [animation-delay:640ms]" />
        <div className="absolute top-0 bottom-0 left-[80%] w-px origin-top scale-y-0 animate-[drawY_900ms_cubic-bezier(.22,.61,.36,1)_forwards] bg-[#27272a] opacity-75 will-change-[transform,opacity] [animation-delay:760ms]" />
      </div>

      {/* Hero */}
      <main className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="mb-3.5 text-xs tracking-[0.14em] text-[#a1a1aa] uppercase">Introducing</div>
          <h1 className="m-0 text-[clamp(32px,8vw,88px)] leading-[0.95] font-semibold text-[#fafafa]">
            Build fast.
            <br />
            Ship clean.
          </h1>
          <p className="mt-[18px] text-[clamp(14px,2.2vw,18px)] text-[#a1a1aa]">
            A minimal React starter focused on clarity, speed, and maintainability.
          </p>
        </div>
      </main>

      {/* Bottom content */}
      <section className="absolute right-0 bottom-0 left-0 grid place-items-center gap-1.5 border-t border-[#27272a] px-6 py-8 text-center">
        <div className="text-xs tracking-[0.08em] text-[#a1a1aa] uppercase">Designed for focus</div>
        <div className="text-[22px] font-semibold text-[#fafafa]">Composable. Accessible. Production-ready.</div>
        <p className="max-w-[680px] text-sm text-[#a1a1aa]">
          Start with sensible defaults, ship without the noise, and scale your UI with confidence. Works across any app
          architecture.
        </p>
      </section>
    </section>
  );
}
