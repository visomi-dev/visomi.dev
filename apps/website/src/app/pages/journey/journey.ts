import { Component, inject, type OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { SEO } from '../../shared/seo';
import { Navbar } from '../../shared/layout/navbar/navbar';

@Component({
  selector: 'app-journey',
  imports: [Navbar, NgOptimizedImage],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black',
  },
})
export class Journey implements OnInit {
  private readonly seo = inject(SEO);

  ngOnInit(): void {
    this.seo.configure({
      title: $localize`:@@journeyPageTitleMetadata:Journey | Michael Villalba`,
      description: $localize`:@@journeyPageDescriptionMetadata:A professional timeline of Michael Villalba's engineering career, from early development to technical leadership in high-scale platforms.`,
      url: 'https://visomi.dev/journey',
      preview: 'https://visomi.dev/assets/images/galaxy-illustration.webp',
      keywords: 'Michael Villalba, Engineering Journey, Tech Lead, Career Timeline, Full-Stack Developer',
    });
  }
}
