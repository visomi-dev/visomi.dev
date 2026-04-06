import { Component, inject, type OnInit } from '@angular/core';

import { SEO } from '../../shared/seo';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.html',
  styleUrl: './resume.css',
  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black',
  },
})
export class Resume implements OnInit {
  private readonly seo = inject(SEO);

  ngOnInit(): void {
    this.seo.configure({
      title: $localize`:@@resumePageTitle:Resume | Michael Villalba`,
      description: $localize`:@@resumePageDescription:Professional resume of Michael Villalba, a senior full-stack developer specializing in scalable systems and crossover identities.`,
      url: 'https://visomi.dev/resume',
      preview: 'https://visomi.dev/assets/images/galaxy-illustration.webp',
      keywords: 'Michael Villalba, visomi, Resume, Full-Stack Developer, Tech Lead, Architect',
    });
  }
}
