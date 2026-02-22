import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-introduction-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="intro-title" class="space-y-4">
      <h1 id="intro-title" class="text-3xl font-semibold tracking-tight sm:text-5xl">{{ title() }}</h1>
      <p class="text-base leading-7 text-slate-300 sm:text-lg">{{ subtitle() }}</p>
    </section>
  `,
})
export class IntroductionHero {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
