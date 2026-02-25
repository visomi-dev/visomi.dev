import { Component, computed, effect, ElementRef, inject, LOCALE_ID, signal, viewChildren } from '@angular/core';

export type LanguageItem = {
  code: string;
  name: string;
};

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  readonly locale = inject(LOCALE_ID);

  readonly languages: LanguageItem[] = [
    { code: 'en', name: 'EN' },
    { code: 'es', name: 'ES' },
  ];

  readonly activeLanguage = signal('en');

  private readonly langItemElements = viewChildren<ElementRef<HTMLElement>>('langItem');

  // Computed position for the lamp indicator
  readonly lampPosition = computed(() => {
    const active = this.activeLanguage();
    const items = this.langItemElements();
    const langList = this.languages;

    if (!active || items.length === 0) return { left: 0, width: 0 };

    const activeIndex = langList.findIndex((l) => l.code === active);
    const activeEl = items[activeIndex]?.nativeElement;

    if (activeEl) {
      return {
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      };
    }

    return { left: 0, width: 0 };
  });

  getLanguageLink(code: string): string {
    return code === 'en' ? '/' : `/${code}/`;
  }

  isActive(code: string): boolean {
    return this.activeLanguage() === code;
  }

  readonly localeInitEffect = effect(
    () => {
      if (this.locale.includes('es')) {
        this.activeLanguage.set('es');
      } else {
        this.activeLanguage.set('en');
      }

      this.localeInitEffect.destroy();
    },
    {
      manualCleanup: true,
    },
  );
}
