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
    /* tw */ 'no-scroll-print mx-auto flex flex-col w-full md:h-[27.9cm] md:w-[21.6cm] md:flex-row';
}
