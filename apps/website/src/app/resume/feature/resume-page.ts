import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ResumeSection } from '../ui/resume-section';

@Component({
  selector: 'app-resume-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResumeSection],
  template: `
    <main class="mx-auto w-full max-w-4xl p-6 sm:p-10">
      <h1 class="text-3xl font-semibold sm:text-4xl">Resume</h1>
      <div class="mt-8 space-y-6">
        <app-resume-section heading="Experience" body="8+ years delivering Angular and TypeScript products for startups and enterprise teams." />
        <app-resume-section heading="Core skills" body="Angular, Nx monorepos, SSR, accessibility-first UI architecture, and design systems." />
      </div>
    </main>
  `,
})
export class ResumePage {}
