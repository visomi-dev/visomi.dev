import { Component, inject } from '@angular/core';

import { Settings } from '../../settings';

@Component({
  selector: 'app-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css',
})
export class ThemeSwitcher {
  private readonly settings = inject(Settings);

  readonly theme = this.settings.theme;
  readonly themes = this.settings.themes;

  toggleTheme(event?: KeyboardEvent | MouseEvent) {
    if (event instanceof KeyboardEvent && event.code !== 'Space' && event.code !== 'Enter') {
      return;
    }

    const nextTheme = this.themes[(this.themes.indexOf(this.theme()) + 1) % this.themes.length];

    const doc = document as Document & { startViewTransition?: (callback: () => void) => void };

    if (doc.startViewTransition) {
      doc.startViewTransition(() => {
        this.settings.setTheme(nextTheme);
      });
    } else {
      this.settings.setTheme(nextTheme);
    }
  }
}
