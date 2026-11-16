import { DOCUMENT } from '@angular/common';
import { Component, LOCALE_ID, afterNextRender, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({ selector: 'app-preferences', templateUrl: './preferences.html', styleUrl: './preferences.css' })
export class Preferences {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  readonly dark = signal(false);

  readonly language = this.locale;

  languageUrl(locale: 'en' | 'es'): string {
    return `/app/${locale}${this.router.url}`;
  }

  toggle(): void {
    this.dark.update((value) => !value);
    this.document.documentElement.classList.toggle('dark', this.dark());

    try {
      this.document.defaultView?.localStorage.setItem('theme', this.dark() ? 'dark' : 'light');
    } catch {
      /* Storage is optional. */
    }
  }

  private readonly initialize = afterNextRender(() => {
    try {
      this.dark.set(this.document.defaultView?.localStorage.getItem('theme') === 'dark');
    } catch {
      /* Storage is optional. */
    }
    this.document.documentElement.classList.toggle('dark', this.dark());
  });
}
