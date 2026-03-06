import { Component, inject } from '@angular/core';

import { UI } from '../../ui';

@Component({
  selector: 'app-page-navigation-loader',
  imports: [],
  templateUrl: './page-navigation-loader.html',
  styleUrl: './page-navigation-loader.css',
  host: {
    class: /* tw */ 'block',
  },
})
export class PageNavigationLoader {
  private readonly ui = inject(UI);

  readonly loading = this.ui.loading.asReadonly();
  readonly authenticating = this.ui.loading.asReadonly();
  readonly navigating = this.ui.navigating;
}
