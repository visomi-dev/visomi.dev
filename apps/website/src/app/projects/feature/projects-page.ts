import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { ProjectCard } from '../ui/project-card';

interface ProjectSummary {
  id: string;
  title: string;
  budget: string;
  description: string;
}

@Component({
  selector: 'app-projects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectCard],
  template: `
    <main class="mx-auto w-full max-w-5xl p-6 sm:p-10">
      <h1 class="text-3xl font-semibold sm:text-4xl">Projects</h1>
      <p class="mt-2 text-slate-300">Upwork-style listings with project summary and pricing context.</p>
      <section class="mt-8 grid gap-4" aria-label="Freelance opportunities">
        @for (project of projects(); track project.id) {
          <app-project-card
            [id]="project.id"
            [title]="project.title"
            [budget]="project.budget"
            [description]="project.description"
          />
        }
      </section>
    </main>
  `,
})
export class ProjectsPage {
  private readonly projectState = signal<ProjectSummary[]>([
    {
      id: 'saas-dashboard-rebuild',
      title: 'SaaS dashboard rebuild in Angular',
      budget: '$3,500 fixed',
      description: 'Migrate a legacy dashboard to Angular with SSR and accessibility compliance.',
    },
    {
      id: 'internal-design-system',
      title: 'Design system implementation',
      budget: '$65/hr',
      description: 'Create reusable primitives and enforce UI consistency across four internal apps.',
    },
  ]);

  readonly projects = computed(() => this.projectState());
}
