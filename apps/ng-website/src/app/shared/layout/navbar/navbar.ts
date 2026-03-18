import { computed, Component, inject, LOCALE_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, ThemeSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
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

  readonly englishHref = computed(() => this.getLocaleHref('en'));
  readonly spanishHref = computed(() => this.getLocaleHref('es'));

  getLocaleLinkClass(target: 'en' | 'es') {
    return this.locale.toLowerCase().includes(target)
      ? /* tw */ 'pointer-events-none cursor-not-allowed font-bold text-black/50 no-underline dark:text-white/50'
      : /* tw */ 'transition-colors hover:text-black dark:hover:text-white';
  }

  private getLocaleHref(target: 'en' | 'es') {
    const currentUrl = new URL(this.currentPath() || '/', 'http://localhost');
    const pathname = this.stripLocalePrefix(currentUrl.pathname);
    const normalizedPathname = pathname || '/';
    const urlSuffix = `${currentUrl.search}${currentUrl.hash}`;

    if (target === 'es') {
      const spanishPath = normalizedPathname === '/' ? '/es/' : `/es${normalizedPathname}`;

      return `${spanishPath}${urlSuffix}`;
    }

    return `${normalizedPathname}${urlSuffix}`;
  }

  private stripLocalePrefix(pathname: string) {
    if (pathname === '/es') {
      return '/';
    }

    if (pathname.startsWith('/es/')) {
      return pathname.slice(3);
    }

    return pathname;
  }
}
