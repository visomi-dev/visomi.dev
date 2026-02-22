import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="mx-auto w-full max-w-3xl p-6 sm:p-10">
      <a [routerLink]="['/projects']" class="text-sm text-sky-300 underline-offset-4 hover:underline">Back to projects</a>
      <h1 class="mt-4 text-3xl font-semibold sm:text-4xl">Project: {{ projectId() }}</h1>
      <p class="mt-4 text-slate-300">
        This detail page can be connected to a repository and mapper to render full job specifications,
        milestones, and proposal requirements.
      </p>
    </main>
  `,
})
export class ProjectDetailPage {
  private readonly route = inject(ActivatedRoute);
  readonly projectId = computed(() => this.route.snapshot.paramMap.get('id') ?? 'unknown');
}
