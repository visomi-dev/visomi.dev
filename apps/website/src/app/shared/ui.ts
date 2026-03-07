import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UI {
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);

  readonly sidebarMenuOpen = signal<boolean>(false);
  readonly sidebarWorkspaceOpen = signal<boolean>(false);
  readonly navigating = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
      map((event) => event instanceof NavigationStart),
    ),
    {
      initialValue: false,
    },
  );
  readonly navigationEnd = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd)));

  setLoading(loading: boolean) {
    this.loading.set(loading);
  }

  toggleLoading() {
    this.loading.set(!this.loading());
  }
}
