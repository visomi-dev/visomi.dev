import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Deps {
  private readonly locale = inject(LOCALE_ID);

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

  readonly dexie = toSignal(
    from(
      import('dexie')
        .then((module) => module)
        .catch((error) => {
          console.error('Failed to load dexie module:');
          console.error(error);

          return null;
        }),
    ).pipe(shareReplay({ refCount: true, bufferSize: 1 })),
    { initialValue: null },
  );
}
