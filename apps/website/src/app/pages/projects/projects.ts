import { Component, inject, signal, type OnInit } from '@angular/core';

import { SEO } from '../../shared/seo';
import { Navbar } from '../../shared/layout/navbar/navbar';

type ProjectCategory = 'ALL' | 'INFRASTRUCTURE' | 'AI_ML' | 'PRODUCT';

@Component({
  selector: 'app-projects',
  imports: [Navbar],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black',
  },
})
export class Projects implements OnInit {
  private readonly seo = inject(SEO);

  readonly activeCategory = signal<ProjectCategory>('ALL');

  ngOnInit(): void {
    this.seo.configure({
      title: $localize`:@@projectsPageTitle:Projects | Michael Villalba`,
      description: $localize`:@@projectsPageDescription:A curated portfolio of software projects developed by Michael Villalba, ranging from financial tools to open-source systems.`,
      url: 'https://visomi.dev/projects',
      preview: 'https://visomi.dev/assets/images/galaxy-illustration.webp',
      keywords: 'Michael Villalba, Projects, Nive, visomi.dev, Software Engineering, Open Source',
    });
  }

  setCategory(category: ProjectCategory): void {
    this.activeCategory.set(category);
  }
}
