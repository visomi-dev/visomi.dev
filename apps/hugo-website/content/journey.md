---
title: 'Engineering Journey'
description: 'A chronological record of systems built, scaling challenges solved, and production-grade software shipped.'
url: /journey/
---

<section class="pt-24 pb-12 px-4">
  <div class="max-w-4xl mx-auto text-center">
    <span class="font-mono text-sm text-gray-500">{{ i18n "journeyPageLabel" }}</span>
    <h1 class="text-4xl md:text-5xl font-bold mt-4 mb-6">{{ i18n "journeyPageTitle" }}</h1>
    <p class="text-gray-400 max-w-2xl mx-auto">{{ i18n "journeyPageDescription" }}</p>
  </div>
</section>

<section class="py-12 px-4">
  <div class="max-w-4xl mx-auto">
    
    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      <div class="bg-neutral-800/50 rounded-xl p-4 text-center">
        <span class="font-mono text-2xl font-bold text-blue-400">15+</span>
        <p class="text-gray-500 text-sm mt-1">{{ i18n "journeyStatsTotalTime" }}</p>
      </div>
      <div class="bg-neutral-800/50 rounded-xl p-4 text-center">
        <span class="font-mono text-2xl font-bold text-purple-400">Senior</span>
        <p class="text-gray-500 text-sm mt-1">{{ i18n "journeyStatsLevel" }}</p>
      </div>
      <div class="bg-neutral-800/50 rounded-xl p-4 text-center">
        <span class="font-mono text-2xl font-bold text-green-400">Full-Stack</span>
        <p class="text-gray-500 text-sm mt-1">{{ i18n "journeyStatsClass" }}</p>
      </div>
      <div class="bg-neutral-800/50 rounded-xl p-4 text-center">
        <span class="font-mono text-2xl font-bold text-orange-400">Linux</span>
        <p class="text-gray-500 text-sm mt-1">{{ i18n "journeyStatsOS" }}</p>
      </div>
    </div>
    
    <!-- Timeline -->
    <div class="space-y-12">
      <!-- AB InBev -->
      <div class="relative pl-8 border-l border-neutral-800">
        <div class="absolute left-0 top-0 w-2 h-2 rounded-full bg-blue-500 -translate-x-1/2"></div>
        <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <span class="font-mono text-xs text-blue-400">{{ i18n "homeJourneyCompany2022" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-400">{{ i18n "homeJourneyRole2022" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-500 text-sm">Aug 2022 — Present</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">
          Leading technical architecture and development of enterprise-scale systems using React, Node.js on Azure. Designed and implemented data ingestion pipelines and real-time visualization dashboards. Spearheaded the redesign of core messaging infrastructure to handle 10k+ events/sec. Migrated from a monolithic polling system to a push-based architecture using Kafka and gRPC. Reduced latency by 400ms across the board.
        </p>
      </div>
      
      <!-- Solidus Capital -->
      <div class="relative pl-8 border-l border-neutral-800">
        <div class="absolute left-0 top-0 w-2 h-2 rounded-full bg-purple-500 -translate-x-1/2"></div>
        <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <span class="font-mono text-xs text-purple-400">{{ i18n "homeJourneyCompany2021" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-400">{{ i18n "homeJourneyRole2021" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-500 text-sm">Jul 2021 — Jul 2022</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">
          Oversaw technology strategy and product development. Architected secure financial platforms using React, Node.js, and AWS Serverless infrastructure. Managed cross-functional engineering teams.
        </p>
      </div>
      
      <!-- Kavak -->
      <div class="relative pl-8 border-l border-neutral-800">
        <div class="absolute left-0 top-0 w-2 h-2 rounded-full bg-green-500 -translate-x-1/2"></div>
        <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <span class="font-mono text-xs text-green-400">{{ i18n "homeJourneyCompany2020" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-400">{{ i18n "homeJourneyRole2020" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-500 text-sm">Aug 2020 — Jun 2021</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">
          Drove the migration to Nx monorepo and AWS infrastructure. Developed scalable frontend services with Angular and backend systems using Serverless. Integrated complex authentication flows with AWS Cognito.
        </p>
      </div>
      
      <!-- Avanttia -->
      <div class="relative pl-8 border-l border-neutral-800">
        <div class="absolute left-0 top-0 w-2 h-2 rounded-full bg-orange-500 -translate-x-1/2"></div>
        <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <span class="font-mono text-xs text-orange-400">{{ i18n "homeJourneyCompany2018" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-400">{{ i18n "homeJourneyRole2018" }}</span>
          <span class="text-gray-600">|</span>
          <span class="text-gray-500 text-sm">2018 — 2020</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">
          Architected fiscal and accounting applications using Node.js, PostgreSQL, and Vue. Managed development teams and interfaced with government SAT services for compliance.
        </p>
      </div>
    </div>
    
  </div>
</section>
