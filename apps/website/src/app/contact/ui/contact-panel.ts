import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-contact-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-slate-700 bg-slate-900/50 p-5" aria-label="Contact details">
      <p><span class="font-medium">Email:</span> <a class="text-sky-300 underline-offset-4 hover:underline" [href]="'mailto:' + email()">{{ email() }}</a></p>
      <p class="mt-2 text-slate-300">{{ availability() }}</p>
    </section>
  `,
})
export class ContactPanel {
  readonly email = input.required<string>();
  readonly availability = input.required<string>();
}
