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

  readonly isDarkTheme = this.settings.isDarkTheme;

  toggleTheme(event?: KeyboardEvent | MouseEvent) {
    if (event instanceof KeyboardEvent && event.code !== 'Space' && event.code !== 'Enter') {
      return;
    }

    const nextTheme = this.isDarkTheme() ? 'light' : 'dark';
    this.settings.setTheme(nextTheme);
  }
}
