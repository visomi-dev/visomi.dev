---
title: 'Resume'
description: 'Professional resume of Michael Villalba, a senior full-stack developer specializing in scalable systems.'
url: /resume/
---

<section class="pt-24 pb-12 px-4">
  <div class="max-w-4xl mx-auto">
    <span class="font-mono text-sm text-gray-500">{{ i18n "resumePageLabel" }}</span>
    
    <!-- Header -->
    <div class="mt-8 mb-12">
      <h1 class="text-4xl md:text-5xl font-bold">{{ i18n "resumeName" }}</h1>
      <p class="text-xl text-gray-400 mt-4 max-w-2xl">{{ i18n "resumeSummary" }}</p>
      
      <div class="flex flex-wrap gap-4 mt-6">
        <a href="mailto:hello@visomi.dev" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span>hello@visomi.dev</span>
        </a>
        <a href="https://github.com/visomi" target="_blank" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
          </svg>
          <span>github.com/visomi</span>
        </a>
        <a href="https://linkedin.com/in/michaelvillalba" target="_blank" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span>linkedin.com/in/michaelvillalba</span>
        </a>
      </div>
    </div>
    
    <!-- Experience -->
    <div class="mb-12">
      <h2 class="font-mono text-lg text-gray-500 mb-6 pb-2 border-b border-neutral-800">{{ i18n "resumeExpLabel" }}</h2>
      
      <div class="space-y-8">
        <!-- AB InBev -->
        <div>
          <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <span class="font-semibold">{{ i18n "resumeExpABICompany" }}</span>
            <span class="text-gray-600">|</span>
            <span class="text-gray-400">{{ i18n "resumeExpABIDate" }}</span>
          </div>
          <p class="text-blue-400 font-mono text-sm mb-3">{{ i18n "resumeExpABIRole" }}</p>
          <ul class="space-y-2 text-gray-400 text-sm">
            <li>• Design and develop a new architecture with <strong>React and Node.js on Azure</strong>.</li>
            <li>• Develop a Web Scraper and <strong>Power BI</strong> reports for data-driven decisions.</li>
          </ul>
        </div>
        
        <!-- Solidus Capital -->
        <div>
          <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <span class="font-semibold">{{ i18n "resumeExpSCCompany" }}</span>
            <span class="text-gray-600">|</span>
            <span class="text-gray-400">{{ i18n "resumeExpSCDate" }}</span>
          </div>
          <p class="text-purple-400 font-mono text-sm mb-3">{{ i18n "resumeExpSCRole" }}</p>
          <ul class="space-y-2 text-gray-400 text-sm">
            <li>• Design and develop a new architecture with <strong>React, Node.js, SLS, and AWS</strong>.</li>
            <li>• Lead Team Management and Product Development initiatives for financial growth.</li>
          </ul>
        </div>
        
        <!-- Kavak -->
        <div>
          <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <span class="font-semibold">{{ i18n "resumeExpKavakCompany" }}</span>
            <span class="text-gray-600">|</span>
            <span class="text-gray-400">{{ i18n "resumeExpKavakDate" }}</span>
          </div>
          <p class="text-green-400 font-mono text-sm mb-3">{{ i18n "resumeExpKavakRole" }}</p>
          <ul class="space-y-2 text-gray-400 text-sm">
            <li>• Spearheaded the migration to <strong>NX Monorepo and AWS</strong>.</li>
            <li>• Developed modular tools with <strong>Angular and Serverless (SLS)</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Stack -->
    <div class="mb-12">
      <h2 class="font-mono text-lg text-gray-500 mb-6 pb-2 border-b border-neutral-800">{{ i18n "resumeStackLabel" }}</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-gray-400 text-sm mb-2">{{ i18n "resumeStackLangLabel" }}</h3>
          <p class="font-mono text-sm">TypeScript (Node.js), Go, Python, C#, Rust, Bash, PostgreSQL, Redis</p>
        </div>
        <div>
          <h3 class="text-gray-400 text-sm mb-2">{{ i18n "resumeStackInfraLabel" }}</h3>
          <p class="font-mono text-sm">Angular, React, Node.js, Express, AWS (SLS, Lambda, Cognito), Azure, NX Monorepos</p>
        </div>
      </div>
    </div>
    
    <!-- Open Source -->
    <div class="mb-12">
      <h2 class="font-mono text-lg text-gray-500 mb-6 pb-2 border-b border-neutral-800">{{ i18n "resumeOssLabel" }}</h2>
      
      <div>
        <h3 class="font-semibold mb-2">{{ i18n "resumeOss1Title" }}</h3>
        <p class="text-gray-400 text-sm">{{ i18n "resumeOss1Desc" }}</p>
      </div>
    </div>
    
    <!-- Education -->
    <div class="mb-12">
      <h2 class="font-mono text-lg text-gray-500 mb-6 pb-2 border-b border-neutral-800">{{ i18n "resumeEduLabel" }}</h2>
      
      <div>
        <h3 class="font-semibold mb-2">{{ i18n "resumeEdu1Title" }}</h3>
        <p class="text-gray-400 text-sm mb-1">{{ i18n "resumeEdu1School" }}</p>
        <p class="text-gray-500 text-sm font-mono">{{ i18n "resumeEdu1Date" }}</p>
      </div>
    </div>
    
  </div>
</section>

<!-- Footer ATS-friendly -->
<footer class="py-8 border-t border-neutral-800 mt-12">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <p class="font-mono text-xs text-gray-600">{{ i18n "resumeFooterCopyright" }}</p>
    <p class="font-mono text-xs text-gray-700 mt-2">{{ i18n "resumeFooterAts" }}</p>
  </div>
</footer>
