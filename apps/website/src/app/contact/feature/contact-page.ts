import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContactPanel } from '../ui/contact-panel';

@Component({
  selector: 'app-contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContactPanel],
  template: `
    <main class="mx-auto w-full max-w-3xl p-6 sm:p-10">
      <h1 class="text-3xl font-semibold sm:text-4xl">Contact</h1>
      <p class="mt-2 text-slate-300">Share your project goals and timeline to get a tailored proposal.</p>
      <app-contact-panel class="mt-8 block" email="hello@visomi.dev" availability="Open for new work starting next month" />
    </main>
  `,
})
export class ContactPage {}
