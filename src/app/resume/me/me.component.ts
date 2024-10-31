import { Component, HostBinding } from '@angular/core';

import { PersonalInfoComponent } from './personal-info/personal-info.component';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [PersonalInfoComponent],
  templateUrl: './me.component.html',
  styleUrl: './me.component.css',
})
export class MeComponent {
  @HostBinding('class') readonly class = /* tw */ 'block w-full min-h-full';
}
