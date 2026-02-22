import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
      <h2 class="text-xl font-medium">{{ title() }}</h2>
      <p class="mt-1 text-sm text-emerald-300">{{ budget() }}</p>
      <p class="mt-3 text-slate-300">{{ description() }}</p>
      <a
        class="mt-4 inline-flex text-sm font-medium text-sky-300 underline-offset-4 hover:underline"
        [routerLink]="['/projects', id()]"
      >
        View project details
      </a>
    </article>
  `,
})
export class ProjectCard {
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly budget = input.required<string>();
  readonly description = input.required<string>();
}
