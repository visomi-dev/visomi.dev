import { Component, HostBinding } from '@angular/core';

import { MeComponent } from './me/me.component';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [MeComponent],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css',
})
export default class ResumeComponent {
  @HostBinding('class') readonly class =
    /* tw */ 'no-scroll-print mx-auto flex flex-col min-h-full w-full overflow-y-auto md:h-[21.6cm] md:w-[27.9cm] md:flex-row';
}
