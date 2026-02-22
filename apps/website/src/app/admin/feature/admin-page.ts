import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto w-full max-w-3xl p-6 sm:p-10">
      <h1 class="text-3xl font-semibold sm:text-4xl">Admin</h1>
      <p class="mt-2 text-slate-300">Protected area for administrative workflows and internal controls.</p>
    </main>
  `,
})
export class AdminPage {}
