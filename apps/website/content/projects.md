---
title: 'Projects'
description: 'A curated portfolio of software projects, ranging from financial systems to modular web architectures.'
url: /projects/
---

<section class="pt-24 pb-12 px-4">
  <div class="max-w-6xl mx-auto text-center">
    <span class="font-mono text-sm text-gray-500">{{ i18n "projectsLabel" }}</span>
    <h1 class="text-4xl md:text-5xl font-bold mt-4 mb-6">
      {{ i18n "projectsTitle1" }} <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{{ i18n "projectsTitle2" }}</span>
    </h1>
    <p class="text-gray-400 max-w-2xl mx-auto">{{ i18n "projectsDescription" }}</p>
  </div>
</section>

<section class="py-12 px-4">
  <div class="max-w-6xl mx-auto">
    
    <!-- Filter tabs -->
    <div class="flex justify-center gap-4 mb-12">
      <button class="px-4 py-2 rounded-full bg-white text-black text-sm font-medium">{{ i18n "projectsFilterAll" }}</button>
      <button class="px-4 py-2 rounded-full border border-neutral-700 text-gray-400 text-sm hover:border-neutral-500 transition-colors">{{ i18n "projectsFilterProduct" }}</button>
    </div>
    
    <!-- Projects Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- Nive -->
      <div class="bg-neutral-800/50 rounded-2xl overflow-hidden border border-neutral-700 hover:border-neutral-500 transition-colors group">
        <div class="h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <svg class="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="p-6">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-2 py-1 text-xs font-mono bg-blue-500/20 text-blue-400 rounded">Angular</span>
            <span class="px-2 py-1 text-xs font-mono bg-gray-700 text-gray-300 rounded">Express.js</span>
            <span class="px-2 py-1 text-xs font-mono bg-gray-700 text-gray-300 rounded">PostgreSQL</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ i18n "projectsNiveTitle" }}</h3>
          <p class="text-gray-400 text-sm mb-4">{{ i18n "projectsNiveDesc" }}</p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ i18n "projectsStatusPhase" }}: MVP</span>
            <a href="#" class="text-blue-400 hover:text-blue-300">View →</a>
          </div>
        </div>
      </div>
      
      <!-- visomi.dev -->
      <div class="bg-neutral-800/50 rounded-2xl overflow-hidden border border-neutral-700 hover:border-neutral-500 transition-colors group">
        <div class="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <svg class="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <div class="p-6">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-2 py-1 text-xs font-mono bg-purple-500/20 text-purple-400 rounded">Angular</span>
            <span class="px-2 py-1 text-xs font-mono bg-gray-700 text-gray-300 rounded">Nx</span>
            <span class="px-2 py-1 text-xs font-mono bg-gray-700 text-gray-300 rounded">Tailwind</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ i18n "projectsVisomiTitle" }}</h3>
          <p class="text-gray-400 text-sm mb-4">{{ i18n "projectsVisomiDesc" }}</p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ i18n "projectsStatusLicense" }}: MIT</span>
            <a href="https://github.com/visomi/visomi.dev" target="_blank" class="text-purple-400 hover:text-purple-300">View →</a>
          </div>
        </div>
      </div>
      
      <!-- Coming Soon -->
      <div class="bg-neutral-800/30 rounded-2xl overflow-hidden border border-neutral-800 border-dashed hover:border-neutral-600 transition-colors group">
        <div class="h-48 bg-neutral-800/30 flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2 text-gray-500">{{ i18n "projectsFutureTitle" }}</h3>
          <p class="text-gray-600 text-sm">Next chapter of the journey...</p>
        </div>
      </div>
      
    </div>
  </div>
</section>
