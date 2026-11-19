import { Component, LOCALE_ID, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { languageSwitcher } from '@visomi-stack/web-frontend-ui/lib/language-switcher';

import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { BrowserPrivacy } from '../../observability/browser-privacy/browser-privacy';

@Component({
  selector: 'app-preferences',
  imports: [BrowserPrivacy, ThemeSwitcher],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
  host: { class: /* tw */ 'flex flex-wrap items-center gap-2 sm:gap-4' },
})
export class Preferences {
  private readonly router = inject(Router);
  protected readonly locale = inject(LOCALE_ID);

  private readonly url = computed(() => {
    const url = this.router.lastSuccessfulNavigation()?.finalUrl;

    return url ? this.router.serializeUrl(url) : this.router.url;
  });
  protected readonly english = computed(() => '/app/en' + this.url());
  protected readonly spanish = computed(() => '/app/es' + this.url());

  protected readonly styles = languageSwitcher;
  protected readonly languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ] as const;
}
