import { inject, Injectable, LOCALE_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map, shareReplay } from 'rxjs';
import type { DateTime } from 'luxon';
import type * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class Deps {
  private readonly locale = inject(LOCALE_ID);

  DateTime: typeof DateTime | null = null;
  dateTimePromise: Promise<typeof DateTime> | null = null;

  Three: typeof THREE | null = null;
  threePromise: Promise<typeof THREE> | null = null;
  readonly now = toSignal(from(this.getDateTime()).pipe(map((dateTime) => dateTime.now())));
  readonly three = toSignal(from(this.getThree()).pipe(map((three) => three)));
  readonly $DateTime = signal<typeof DateTime | null>(null);
  readonly $THREE = signal<typeof THREE | null>(null);

  constructor() {
    this.getDateTime();
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

  async getThree(): Promise<typeof THREE> {
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

  readonly uuid = toSignal(
    from(
      import('uuid')
        .then((module) => module)
        .catch((error) => {
          console.error('Failed to load uuid module:');
          console.error(error);

          return null;
        }),
    ).pipe(shareReplay({ refCount: true, bufferSize: 1 })),
    { initialValue: null },
  );

  readonly luxon = toSignal(
    from(
      import('luxon')
        .then((module) => {
          module.Settings.defaultLocale = this.locale;

          return module;
        })
        .catch((error) => {
          console.error('Failed to load luxon module:');
          console.error(error);

          return null;
        }),
    ).pipe(shareReplay({ refCount: true, bufferSize: 1 })),
    { initialValue: null },
  );
}
