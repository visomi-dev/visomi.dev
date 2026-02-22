import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-resume-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
      <h2 class="text-xl font-medium">{{ heading() }}</h2>
      <p class="mt-2 text-slate-300">{{ body() }}</p>
    </section>
  `,
})
export class ResumeSection {
  readonly heading = input.required<string>();
  readonly body = input.required<string>();
}
