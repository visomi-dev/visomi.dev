import { inject, Injectable } from '@angular/core';
import { combineLatest, lastValueFrom, map, of, switchMap, take } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { DB } from './db';
import { Deps } from './deps';
import { Budget } from './entities/db';

@Injectable({
  providedIn: 'root',
})
export class Budgets {
  private readonly deps = inject(Deps);
  private readonly db = inject(DB);

  readonly latest = toSignal(
    combineLatest({
      dexie: toObservable(this.deps.dexie),
      budgets: toObservable(this.db.budgets),
    }).pipe(
      switchMap(({ dexie, budgets }) => {
        if (!dexie || !budgets) {
          return of(null);
        }

        return dexie.liveQuery(() => budgets.orderBy('createdAt').last());
      }),
      map((budget) => {
        return budget ?? null;
      }),
    ),
    {
      initialValue: null,
    },
  );

  async getLatest(): Promise<Budget | null> {
    const budget = await lastValueFrom(toObservable(this.latest).pipe(take(1)));

    return budget;
  }
}
