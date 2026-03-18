import { isPlatformBrowser } from '@angular/common';
import { computed, DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { DEVICE_ID_KEY, THEME_KEY } from './constants/storage';
import { Deps } from './deps';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class Settings {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly deps = inject(Deps);

  readonly themes: Theme[] = ['light', 'dark', 'system'];

  readonly deviceId = signal<string | null>(this.getDeviceId());
  readonly theme = signal<Theme>(this.getInitialTheme());

  readonly isDarkTheme = computed(() => {
    const theme = this.theme();

    if (theme === 'dark') {
      return true;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  getDeviceId() {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (!isBrowser) {
      return null;
    }

    return localStorage.getItem(DEVICE_ID_KEY);
  }

  getInitialTheme(): Theme {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (!isBrowser) {
      return 'system';
    }

    const storedTheme = (localStorage.getItem(THEME_KEY) ?? 'system') as Theme;

    return storedTheme;
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);

    localStorage.setItem(THEME_KEY, theme);
  }

  readonly setDeviceIdEffect = effect(() => {
    const isBrowser = isPlatformBrowser(this.platformId);
    const uuid = this.deps.uuid();

    if (!isBrowser || !uuid) {
      return;
    }

    if (!this.deviceId()) {
      const newDeviceId = uuid.v4();

      localStorage.setItem(DEVICE_ID_KEY, newDeviceId);

      this.deviceId.set(newDeviceId);
    }
  });

  readonly toggleThemeClassEffect = effect(() => {
    if (this.isDarkTheme()) {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  });
}
