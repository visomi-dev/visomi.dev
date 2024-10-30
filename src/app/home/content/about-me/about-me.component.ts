import { Component, HostBinding } from '@angular/core';

import { nav } from '../../constants';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css',
})
export class AboutMeComponent {
  @HostBinding('class') readonly class = /* tw */ 'flex flex-col w-full';

  nav = nav;
}
