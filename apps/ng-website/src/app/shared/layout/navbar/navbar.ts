import { DOCUMENT } from '@angular/common';
import { computed, Component, inject, LOCALE_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

const ACTIVE_NAV_LINK_CLASS = 'text-black! dark:text-white!';
const INACTIVE_NAV_LINK_CLASS = /* tw */ 'transition-colors hover:text-black dark:hover:text-white';
const LOCALIZED_BASE_SEGMENTS = ['es'];

@Component({
  selector: 'app-navbar',
  imports: [ThemeSwitcher],
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

  readonly homeHref = computed(() => this.getNavHref('/'));
  readonly journeyHref = computed(() => this.getNavHref('/journey'));
  readonly projectsHref = computed(() => this.getNavHref('/projects'));
  readonly resumeHref = computed(() => this.getNavHref('/resume'));
  readonly contactHref = computed(() => this.getNavHref('/contact'));
  readonly englishHref = computed(() => this.getLocaleHref('en'));
  readonly spanishHref = computed(() => this.getLocaleHref('es'));

  getLocaleLinkClass(target: 'en' | 'es') {
    return this.locale.toLowerCase().includes(target)
      ? /* tw */ 'pointer-events-none cursor-not-allowed font-bold text-black/50 no-underline dark:text-white/50'
      : INACTIVE_NAV_LINK_CLASS;
  }

  getNavLinkClass(path: string) {
    return this.isCurrentRoute(path) ? `${INACTIVE_NAV_LINK_CLASS} ${ACTIVE_NAV_LINK_CLASS}` : INACTIVE_NAV_LINK_CLASS;
  }

  navigate(event: MouseEvent, path: string) {
    if (!this.shouldHandleNavigation(event)) {
      return;
    }

    event.preventDefault();

    void this.router.navigateByUrl(path);
  }

  private getLocaleHref(target: 'en' | 'es') {
    const currentUrl = new URL(this.currentPath() || '/', 'http://localhost');
    const pathname = this.stripLocalePrefix(currentUrl.pathname);
    const normalizedPathname = pathname || '/';
    const urlSuffix = `${currentUrl.search}${currentUrl.hash}`;
    const siteBasePath = this.getSiteBasePath();

    if (target === 'es') {
      return `${this.buildHref(this.appendBaseSegment(siteBasePath, 'es'), normalizedPathname)}${urlSuffix}`;
    }

    return `${this.buildHref(siteBasePath, normalizedPathname)}${urlSuffix}`;
  }

  private getNavHref(path: string) {
    return this.buildHref(this.getBasePath(), path);
  }

  private isCurrentRoute(path: string) {
    const currentUrl = new URL(this.currentPath() || '/', 'http://localhost');
    const currentPathname = this.normalizePathname(this.stripLocalePrefix(currentUrl.pathname));

    return currentPathname === this.normalizePathname(path);
  }

  private shouldHandleNavigation(event: MouseEvent) {
    return !(
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.defaultPrevented
    );
  }

  private getBasePath() {
    return this.normalizeBasePath(new URL(this.document.baseURI).pathname);
  }

  private getSiteBasePath() {
    const normalizedBasePath = this.getBasePath();
    const trimmedBasePath = normalizedBasePath === '/' ? '' : normalizedBasePath.slice(0, -1);

    for (const segment of LOCALIZED_BASE_SEGMENTS) {
      const suffix = `/${segment}`;

      if (trimmedBasePath.endsWith(suffix)) {
        return this.normalizeBasePath(trimmedBasePath.slice(0, -suffix.length) || '/');
      }
    }

    return normalizedBasePath;
  }

  private appendBaseSegment(basePath: string, segment: string) {
    return this.normalizeBasePath(
      new URL(`${segment}/`, `http://localhost${this.normalizeBasePath(basePath)}`).pathname,
    );
  }

  private buildHref(basePath: string, path: string) {
    const normalizedBasePath = this.normalizeBasePath(basePath);
    const normalizedPath = this.normalizePathname(path);

    if (normalizedPath === '/') {
      return normalizedBasePath;
    }

    return new URL(normalizedPath.slice(1), `http://localhost${normalizedBasePath}`).pathname;
  }

  private normalizeBasePath(pathname: string) {
    if (pathname === '/') {
      return pathname;
    }

    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }

  private normalizePathname(pathname: string) {
    if (pathname === '/') {
      return pathname;
    }

    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  }

  private stripLocalePrefix(pathname: string) {
    for (const segment of LOCALIZED_BASE_SEGMENTS) {
      const prefix = `/${segment}`;

      if (pathname === prefix) {
        return '/';
      }

      if (pathname.startsWith(`${prefix}/`)) {
        return pathname.slice(prefix.length);
      }
    }

    return pathname;
  }
}
