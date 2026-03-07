import { Component, signal } from '@angular/core';

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
export class Projects {
  readonly activeCategory = signal<ProjectCategory>('ALL');

  setCategory(category: ProjectCategory): void {
    this.activeCategory.set(category);
  }
}
