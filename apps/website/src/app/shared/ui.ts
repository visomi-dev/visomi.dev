import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, from, map } from 'rxjs';
import type { DateTime } from 'luxon';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class UI {
  DateTime: typeof DateTime | null = null;
  dateTimePromise: Promise<typeof DateTime> | null = null;

  Three: typeof import('three') | null = null;
  threePromise: Promise<typeof import('three')> | null = null;

  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly now = toSignal(from(this.getDateTime()).pipe(map((dateTime) => dateTime.now())));
  readonly three = toSignal(from(this.getThree()).pipe(map((three) => three)));
  readonly $DateTime = signal<typeof DateTime | null>(null);
  readonly $THREE = signal<typeof import('three') | null>(null);

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

  async getDateTime() {
    if (this.DateTime != null) {
      return this.DateTime;
    }

    if (this.dateTimePromise != null) {
      return await this.dateTimePromise;
    }

    this.dateTimePromise = import('luxon').then(({ DateTime: dateTime }) => {
      this.DateTime = dateTime;
      this.$DateTime.set(dateTime);

      return dateTime;
    });

    return await this.dateTimePromise;
  }

  async getThree(): Promise<typeof import('three')> {
    if (this.Three != null) {
      return this.Three;
    }

    if (this.threePromise != null) {
      return await this.threePromise;
    }

    this.threePromise = import('three').then((module) => {
      this.Three = module;
      this.$THREE.set(module);
      return module;
    });

    return await this.threePromise;
  }

  constructor() {
    this.getDateTime();
  }
}
