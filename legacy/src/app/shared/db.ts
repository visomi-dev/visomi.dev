import { isPlatformBrowser } from '@angular/common';
import { computed, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DB {
  readonly platformId = inject(PLATFORM_ID);

  readonly db = toSignal(
    from(
      import('./db/app')
        .then((m) => {
          if (isPlatformBrowser(this.platformId)) {
            return new m.DB();
          }

          return null;
        })
        .catch((error) => {
          console.error('Failed to load App DB:');
          console.error(error);

          return null;
        }),
    ).pipe(shareReplay({ refCount: true, bufferSize: 1 })),
    { initialValue: null },
  );

  readonly budgets = computed(() => {
    const db = this.db();

    return db ? db.budgets : null;
  });

  readonly budgetEntries = computed(() => {
    const db = this.db();

    return db ? db.budgetEntries : null;
  });
}
