import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';

import { Settings } from '../../settings';

@Component({
  selector: 'app-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css',
  animations: [
    trigger('upward', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(4rem)' }),
        animate('400ms', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':leave', [
        animate('400ms', style({ opacity: 0, transform: 'translateY(-4rem)' })),
      ]),
    ]),
  ],
})
export class ThemeSwitcher {
  private readonly settings = inject(Settings);

  readonly theme = this.settings.theme;
  readonly themes = this.settings.themes;

  toggleTheme(event?: KeyboardEvent) {
    if (!event || event?.code === 'Space') {
      const nextTheme =
        this.themes[
          (this.themes.indexOf(this.theme()) + 1) % this.themes.length
        ];

      this.settings.setTheme(nextTheme);
    }
  }
}
