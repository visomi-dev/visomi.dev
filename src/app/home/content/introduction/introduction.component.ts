import { Component, HostBinding } from '@angular/core';
import { RouterLink } from '@angular/router';

import { nav } from '../../constants';

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css',
})
export class IntroductionComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  nav = nav;
}
