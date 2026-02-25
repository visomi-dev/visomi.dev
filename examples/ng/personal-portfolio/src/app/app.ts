import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StarfieldComponent } from './starfield.component';
import { MatIconModule } from '@angular/material/icon';
import { NavBarComponent, NavItem } from './nav-bar.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [StarfieldComponent, MatIconModule, NavBarComponent],
  template: `
    <app-starfield></app-starfield>
    
    <app-nav-bar [items]="navItems"></app-nav-bar>

    <!-- Language Switcher (Floating) -->
    <div class="fixed top-6 right-6 z-50 flex gap-4 text-sm font-medium backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-full px-4 py-2 shadow-xl">
      <button class="text-white">EN</button>
      <span class="text-slate-600">|</span>
      <button class="text-slate-400 hover:text-white transition-colors">ES</button>
    </div>

    <!-- Hero Section -->
    <section id="home" class="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <main class="w-full max-w-4xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-8 sm:p-16 shadow-2xl relative overflow-hidden">
        <!-- Decorative glow -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div class="flex flex-col items-center text-center space-y-10 relative z-10">
          
          <!-- Avatar -->
          <div class="relative group">
            <div class="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <img src="https://picsum.photos/seed/michael/200/200" alt="Michael" class="relative w-40 h-40 rounded-full border-2 border-slate-700/80 shadow-2xl object-cover" referrerPolicy="no-referrer" />
          </div>

          <!-- Intro -->
          <div class="space-y-6">
            <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
              Hello! <span class="inline-block animate-bounce origin-bottom">👋</span> I'm Michael
            </h1>
            <p class="text-xl sm:text-2xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
              and I transform <span class="text-blue-400 font-medium">ideas into reality</span> through software development.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap justify-center gap-4 pt-4">
            <a href="#contact" class="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
              <mat-icon class="text-sm">mail</mat-icon>
              Contact Me
            </a>
            <a href="#resume" class="px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-all flex items-center gap-2">
              <mat-icon class="text-sm">description</mat-icon>
              Resume
            </a>
          </div>
          
        </div>
      </main>
      
      <!-- Scroll Indicator -->
      <a href="#about" class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors animate-bounce">
        <span class="text-xs tracking-widest uppercase font-medium">Scroll</span>
        <mat-icon>keyboard_arrow_down</mat-icon>
      </a>
    </section>
    
    <!-- About Section -->
    <section id="about" class="relative z-10 min-h-screen flex items-center justify-center p-6 sm:p-12 bg-slate-950/80 border-t border-white/5">
      <div class="w-full max-w-5xl">
        <div class="flex items-center gap-4 mb-12">
          <div class="w-12 h-px bg-blue-500/50"></div>
          <h2 class="text-3xl font-semibold text-white tracking-tight">About Me</h2>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-6 text-lg text-slate-300 leading-relaxed font-light">
            <p>
              I am a passionate software developer with a keen eye for design and a drive to build elegant, scalable solutions. My journey in tech started with a fascination for how things work under the hood.
            </p>
            <p>
              When I'm not coding, you can find me exploring new technologies, contributing to open-source, or enjoying a good cup of coffee while stargazing.
            </p>
            <div class="pt-6">
              <img src="https://picsum.photos/seed/setup/600/400" alt="Workspace" class="rounded-2xl border border-slate-800 shadow-2xl opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
             <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800/50 transition-colors">
               <div class="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                 <mat-icon class="text-4xl w-10 h-10">code</mat-icon>
               </div>
               <span class="text-base font-medium text-slate-200">Frontend</span>
             </div>
             <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800/50 transition-colors">
               <div class="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                 <mat-icon class="text-4xl w-10 h-10">dns</mat-icon>
               </div>
               <span class="text-base font-medium text-slate-200">Backend</span>
             </div>
             <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800/50 transition-colors">
               <div class="p-4 bg-purple-500/10 rounded-2xl text-purple-400">
                 <mat-icon class="text-4xl w-10 h-10">brush</mat-icon>
               </div>
               <span class="text-base font-medium text-slate-200">Design</span>
             </div>
             <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800/50 transition-colors">
               <div class="p-4 bg-orange-500/10 rounded-2xl text-orange-400">
                 <mat-icon class="text-4xl w-10 h-10">storage</mat-icon>
               </div>
               <span class="text-base font-medium text-slate-200">Database</span>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="relative z-10 min-h-screen flex items-center justify-center p-6 sm:p-12 bg-slate-950 border-t border-white/5">
      <div class="w-full max-w-5xl">
        <div class="flex items-center gap-4 mb-12">
          <div class="w-12 h-px bg-blue-500/50"></div>
          <h2 class="text-3xl font-semibold text-white tracking-tight">Selected Projects</h2>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Project 1 -->
          <div class="group relative bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-600 transition-colors">
            <div class="aspect-video overflow-hidden">
              <img src="https://picsum.photos/seed/proj1/800/600" alt="Project 1" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
            <div class="p-8">
              <h3 class="text-xl font-semibold text-white mb-2">Stellar Analytics</h3>
              <p class="text-slate-400 font-light mb-6">A real-time dashboard for monitoring distributed systems with predictive scaling.</p>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">Angular</span>
                <span class="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">Node.js</span>
              </div>
            </div>
          </div>
          
          <!-- Project 2 -->
          <div class="group relative bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-600 transition-colors">
            <div class="aspect-video overflow-hidden">
              <img src="https://picsum.photos/seed/proj2/800/600" alt="Project 2" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
            <div class="p-8">
              <h3 class="text-xl font-semibold text-white mb-2">Nebula UI</h3>
              <p class="text-slate-400 font-light mb-6">An open-source component library built with accessibility and dark mode in mind.</p>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">TypeScript</span>
                <span class="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">Tailwind</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 py-8 border-t border-white/5 bg-slate-950 text-center text-slate-500 text-sm">
      <p>© 2026 Michael. Crafted with <mat-icon class="text-[14px] inline align-middle text-red-500/80">favorite</mat-icon> and stardust.</p>
    </footer>
  `,
})
export class App {
  navItems: NavItem[] = [
    { name: 'Home', url: '#home', icon: 'home' },
    { name: 'About', url: '#about', icon: 'person' },
    { name: 'Projects', url: '#projects', icon: 'work' },
    { name: 'Contact', url: '#contact', icon: 'mail' },
  ];
}
