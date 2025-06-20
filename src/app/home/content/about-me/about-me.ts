import { Component, HostBinding } from '@angular/core';

import { nav } from '../../constants';

@Component({
  selector: 'app-about-me',
  imports: [],
  templateUrl: './about-me.html',
  styleUrl: './about-me.css',
})
export class AboutMe {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  nav = nav;
}
