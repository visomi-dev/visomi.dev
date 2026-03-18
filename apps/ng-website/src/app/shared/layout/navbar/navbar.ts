import { DOCUMENT } from '@angular/common';
import { computed, Component, inject, LOCALE_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { getAppHref, getLocaleHref } from '../../app-href';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, ThemeSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  readonly locale = inject(LOCALE_ID);

  readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly homeHref = computed(() => getAppHref(this.document.baseURI, '/'));
  readonly journeyHref = computed(() => getAppHref(this.document.baseURI, '/journey'));
  readonly projectsHref = computed(() => getAppHref(this.document.baseURI, '/projects'));
  readonly resumeHref = computed(() => getAppHref(this.document.baseURI, '/resume'));
  readonly contactHref = computed(() => getAppHref(this.document.baseURI, '/contact'));
  readonly englishHref = computed(() => getLocaleHref(this.document.baseURI, this.currentPath() || '/', 'en'));
  readonly spanishHref = computed(() => getLocaleHref(this.document.baseURI, this.currentPath() || '/', 'es'));

  getLocaleLinkClass(target: 'en' | 'es') {
    return this.locale.toLowerCase().includes(target)
      ? /* tw */ 'pointer-events-none cursor-not-allowed font-bold text-black/50 no-underline dark:text-white/50'
      : /* tw */ 'transition-colors hover:text-black dark:hover:text-white';
  }
}
