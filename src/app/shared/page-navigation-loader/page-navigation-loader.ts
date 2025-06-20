import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, inject } from '@angular/core';

import { UI } from '../ui';

@Component({
  selector: 'app-page-navigation-loader',
  imports: [],
  templateUrl: './page-navigation-loader.html',
  styleUrl: './page-navigation-loader.css',
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('400ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class PageNavigationLoader {
  @HostBinding('class') readonly cls = /* tw */ 'block';

  private readonly ui = inject(UI);

  readonly loading = this.ui.loading;
  readonly authenticating = this.ui.loading;
  readonly navigating = this.ui.navigating;
}
