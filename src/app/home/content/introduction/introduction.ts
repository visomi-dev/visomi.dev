import { Component, HostBinding } from '@angular/core';
import { RouterLink } from '@angular/router';

import { nav } from '../../constants';

@Component({
  selector: 'app-introduction',
  imports: [RouterLink],
  templateUrl: './introduction.html',
  styleUrl: './introduction.css',
})
export class Introduction {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  nav = nav;
}
