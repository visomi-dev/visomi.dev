import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, viewChild, type ElementRef } from '@angular/core';

import { Settings } from '../../settings';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css',
})
export class ThemeSwitcher {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly settings = inject(Settings);
  private currentTheme: ThemeMode | null = null;

  readonly isDarkTheme = this.settings.isDarkTheme;
  readonly lightIcon = viewChild<ElementRef<SVGElement>>('lightIcon');
  readonly darkIcon = viewChild<ElementRef<SVGElement>>('darkIcon');

  readonly syncIconEffect = effect((onCleanup) => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const lightIconRef = this.lightIcon();
    const darkIconRef = this.darkIcon();

    if (lightIconRef == null || darkIconRef == null) {
      return;
    }

    const lightIcon = lightIconRef.nativeElement;
    const darkIcon = darkIconRef.nativeElement;
    const nextTheme: ThemeMode = this.isDarkTheme() ? 'dark' : 'light';
    let timeoutId: number | undefined;

    if (this.currentTheme == null) {
      this.setStaticIconState(lightIcon, darkIcon, nextTheme);
      this.currentTheme = nextTheme;
      return;
    }

    if (this.currentTheme === nextTheme) {
      return;
    }

    this.currentTheme = nextTheme;

    if (nextTheme === 'dark') {
      lightIcon.classList.remove('upward-enter');
      lightIcon.classList.add('upward-leave');

      timeoutId = window.setTimeout(() => {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
        darkIcon.classList.remove('upward-leave');
        darkIcon.classList.add('upward-enter');
      }, 350);
    } else {
      darkIcon.classList.remove('upward-enter');
      darkIcon.classList.add('upward-leave');

      timeoutId = window.setTimeout(() => {
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
        lightIcon.classList.remove('upward-leave');
        lightIcon.classList.add('upward-enter');
      }, 350);
    }

    onCleanup(() => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    });
  });

  toggleTheme(event?: KeyboardEvent | MouseEvent) {
    if (event instanceof KeyboardEvent && event.code !== 'Space' && event.code !== 'Enter') {
      return;
    }

    const nextTheme = this.isDarkTheme() ? 'light' : 'dark';
    this.settings.setTheme(nextTheme);
  }

  private setStaticIconState(lightIcon: SVGElement, darkIcon: SVGElement, theme: ThemeMode) {
    lightIcon.classList.remove('upward-enter', 'upward-leave');
    darkIcon.classList.remove('upward-enter', 'upward-leave');

    if (theme === 'dark') {
      lightIcon.classList.add('hidden');
      darkIcon.classList.remove('hidden');
      return;
    }

    darkIcon.classList.add('hidden');
    lightIcon.classList.remove('hidden');
  }
}
