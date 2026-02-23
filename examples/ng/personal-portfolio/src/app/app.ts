import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StarfieldComponent } from './starfield.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [StarfieldComponent, MatIconModule],
  template: `
    <app-starfield></app-starfield>

    <!-- Navigation -->
    <nav
      class="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/5 bg-slate-950/50 p-6 backdrop-blur-sm"
    >
      <div class="text-xl font-bold tracking-tighter text-white">M.</div>
      <div class="hidden gap-8 text-sm font-medium text-slate-400 md:flex">
        <a href="#home" class="transition-colors hover:text-white">Home</a>
        <a href="#about" class="transition-colors hover:text-white">About Me</a>
        <a href="#projects" class="transition-colors hover:text-white">Projects</a>
      </div>
      <div class="flex gap-4 text-sm font-medium">
        <button class="text-white">EN</button>
        <span class="text-slate-600">|</span>
        <button class="text-slate-400 transition-colors hover:text-white">ES</button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
      <main
        class="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-700/50 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md sm:p-16"
      >
        <!-- Decorative glow -->
        <div
          class="pointer-events-none absolute top-0 left-1/2 h-32 w-full max-w-lg -translate-x-1/2 rounded-full bg-blue-500/20 blur-[100px]"
        ></div>

        <div class="relative z-10 flex flex-col items-center space-y-10 text-center">
          <!-- Avatar -->
          <div class="group relative">
            <div
              class="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
            ></div>
            <img
              src="https://picsum.photos/seed/michael/200/200"
              alt="Michael"
              class="relative h-40 w-40 rounded-full border-2 border-slate-700/80 object-cover shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <!-- Intro -->
          <div class="space-y-6">
            <h1 class="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Hello! <span class="inline-block origin-bottom animate-bounce">👋</span> I'm Michael
            </h1>
            <p class="mx-auto max-w-2xl text-xl leading-relaxed font-light text-slate-300 sm:text-2xl">
              and I transform <span class="font-medium text-blue-400">ideas into reality</span> through software
              development.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="#contact"
              class="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
            >
              <mat-icon class="text-sm">mail</mat-icon>
              Contact Me
            </a>
            <a
              href="#resume"
              class="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-8 py-3.5 font-medium text-white transition-all hover:bg-slate-700"
            >
              <mat-icon class="text-sm">description</mat-icon>
              Resume
            </a>
          </div>
        </div>
      </main>

      <!-- Scroll Indicator -->
      <a
        href="#about"
        class="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-slate-500 transition-colors hover:text-white"
      >
        <span class="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <mat-icon>keyboard_arrow_down</mat-icon>
      </a>
    </section>

    <!-- About Section -->
    <section
      id="about"
      class="relative z-10 flex min-h-screen items-center justify-center border-t border-white/5 bg-slate-950/80 p-6 sm:p-12"
    >
      <div class="w-full max-w-5xl">
        <div class="mb-12 flex items-center gap-4">
          <div class="h-px w-12 bg-blue-500/50"></div>
          <h2 class="text-3xl font-semibold tracking-tight text-white">About Me</h2>
        </div>

        <div class="grid items-center gap-16 lg:grid-cols-2">
          <div class="space-y-6 text-lg leading-relaxed font-light text-slate-300">
            <p>
              I am a passionate software developer with a keen eye for design and a drive to build elegant, scalable
              solutions. My journey in tech started with a fascination for how things work under the hood.
            </p>
            <p>
              When I'm not coding, you can find me exploring new technologies, contributing to open-source, or enjoying
              a good cup of coffee while stargazing.
            </p>
            <div class="pt-6">
              <img
                src="https://picsum.photos/seed/setup/600/400"
                alt="Workspace"
                class="rounded-2xl border border-slate-800 opacity-80 shadow-2xl transition-opacity hover:opacity-100"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:bg-slate-800/50"
            >
              <div class="rounded-2xl bg-blue-500/10 p-4 text-blue-400">
                <mat-icon class="h-10 w-10 text-4xl">code</mat-icon>
              </div>
              <span class="text-base font-medium text-slate-200">Frontend</span>
            </div>
            <div
              class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:bg-slate-800/50"
            >
              <div class="rounded-2xl bg-emerald-500/10 p-4 text-emerald-400">
                <mat-icon class="h-10 w-10 text-4xl">dns</mat-icon>
              </div>
              <span class="text-base font-medium text-slate-200">Backend</span>
            </div>
            <div
              class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:bg-slate-800/50"
            >
              <div class="rounded-2xl bg-purple-500/10 p-4 text-purple-400">
                <mat-icon class="h-10 w-10 text-4xl">brush</mat-icon>
              </div>
              <span class="text-base font-medium text-slate-200">Design</span>
            </div>
            <div
              class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:bg-slate-800/50"
            >
              <div class="rounded-2xl bg-orange-500/10 p-4 text-orange-400">
                <mat-icon class="h-10 w-10 text-4xl">storage</mat-icon>
              </div>
              <span class="text-base font-medium text-slate-200">Database</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section
      id="projects"
      class="relative z-10 flex min-h-screen items-center justify-center border-t border-white/5 bg-slate-950 p-6 sm:p-12"
    >
      <div class="w-full max-w-5xl">
        <div class="mb-12 flex items-center gap-4">
          <div class="h-px w-12 bg-blue-500/50"></div>
          <h2 class="text-3xl font-semibold tracking-tight text-white">Selected Projects</h2>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <!-- Project 1 -->
          <div
            class="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 transition-colors hover:border-slate-600"
          >
            <div class="aspect-video overflow-hidden">
              <img
                src="https://picsum.photos/seed/proj1/800/600"
                alt="Project 1"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div class="p-8">
              <h3 class="mb-2 text-xl font-semibold text-white">Stellar Analytics</h3>
              <p class="mb-6 font-light text-slate-400">
                A real-time dashboard for monitoring distributed systems with predictive scaling.
              </p>
              <div class="flex gap-2">
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">Angular</span>
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">Node.js</span>
              </div>
            </div>
          </div>

          <!-- Project 2 -->
          <div
            class="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 transition-colors hover:border-slate-600"
          >
            <div class="aspect-video overflow-hidden">
              <img
                src="https://picsum.photos/seed/proj2/800/600"
                alt="Project 2"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div class="p-8">
              <h3 class="mb-2 text-xl font-semibold text-white">Nebula UI</h3>
              <p class="mb-6 font-light text-slate-400">
                An open-source component library built with accessibility and dark mode in mind.
              </p>
              <div class="flex gap-2">
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">TypeScript</span>
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">Tailwind</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/5 bg-slate-950 py-8 text-center text-sm text-slate-500">
      <p>
        © 2026 Michael. Crafted with
        <mat-icon class="inline align-middle text-[14px] text-red-500/80">favorite</mat-icon> and stardust.
      </p>
    </footer>
  `,
})
export class App {}
