import { Component, HostBinding } from '@angular/core';

import { Me } from './me/me';
import { Professional } from './professional/professional';

@Component({
  selector: 'app-resume',
  imports: [Me, Professional],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class Resume {
  @HostBinding('class') readonly cls =
    /* tw */ 'no-scroll-print mx-auto flex flex-col w-full md:h-[27.9cm] md:w-[21.6cm] md:flex-row';
}
