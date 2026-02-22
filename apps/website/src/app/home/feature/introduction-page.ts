import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IntroductionHero } from '../ui/introduction-hero';

@Component({
  selector: 'app-introduction-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IntroductionHero],
  template: `
    <main class="mx-auto w-full max-w-4xl p-6 sm:p-10">
      <app-introduction-hero
        title="Building reliable web experiences"
        subtitle="I design and ship modern Angular applications with maintainable architecture and product focus."
      />
    </main>
  `,
})
export class IntroductionPage {}
