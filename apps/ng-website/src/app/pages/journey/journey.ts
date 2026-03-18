import { Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';

import { SEO } from '../../shared/seo';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.html',
  styleUrl: './journey.css',
  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden bg-surface-light pt-20 text-muted-light transition-colors duration-500 dark:bg-black dark:text-neutral-400 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black',
  },
})
export class Journey implements OnInit {
  private readonly seo = inject(SEO);

  readonly monitorBars = [40, 55, 45, 70, 62, 84, 76, 90, 96, 81, 64, 52];
  readonly analyticsBars = [34, 46, 39, 58, 47, 65, 52, 63, 48, 57, 45, 41];

  ngOnInit(): void {
    this.seo.configure({
      title: $localize`:@@journeyPageTitleMetadata:Journey | Michael Villalba`,
      description: $localize`:@@journeyPageDescriptionMetadata:A timeline of engineering milestones including high-throughput systems, observability metrics, and platform architecture decisions.`,
      url: 'https://visomi.dev/journey',
      preview: 'https://visomi.dev/assets/images/galaxy-illustration.webp',
      keywords: 'Michael Villalba, Engineering Journey, Tech Lead, Career Timeline, Full-Stack Developer',
    });
  }
}
