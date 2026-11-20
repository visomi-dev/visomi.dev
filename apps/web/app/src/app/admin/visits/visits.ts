import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { visitPeriods, type VisitSummary } from '@visomi-stack/web-shared-observability/lib/visits';

import { Session } from '../auth/session';
import { LinkButton } from '../../ui/actions/link-button';
import { Alert } from '../../ui/feedback/alert';
import { Card } from '../../ui/layout/card';
import { Heading } from '../../ui/typography/heading';
import { Text } from '../../ui/typography/text';

@Component({
  selector: 'app-visits',
  imports: [DecimalPipe, RouterLink, LinkButton, Alert, Card, Heading, Text],
  templateUrl: './visits.html',
  styleUrl: './visits.css',
})
export class Visits {
  private readonly session = inject(Session);
  private readonly route = inject(ActivatedRoute);

  private readonly routeData = toSignal(this.route.data);
  private readonly query = toSignal(this.route.queryParamMap);

  protected readonly period = computed(() => (this.query()?.get('period') === '30' ? 30 : 7));
  protected readonly summary = computed(() =>
    this.session.valid() ? (this.routeData()?.['visits'] as VisitSummary | undefined) : undefined,
  );
  protected readonly totals = computed(() => {
    const summary = this.summary();

    if (summary?.state !== 'ready') {
      return null;
    }

    let current = 0;
    let previous = 0;
    const daily = new Map<string, number>();
    const pages = new Map<string, { page: string; locale: 'en' | 'es'; views: number }>();

    for (const row of summary.days) {
      if (row.day < summary.firstDay) {
        previous += row.views;
        continue;
      }

      current += row.views;
      daily.set(row.day, (daily.get(row.day) ?? 0) + row.views);
      const key = row.locale + ':' + row.page;

      pages.set(key, { page: row.page, locale: row.locale, views: (pages.get(key)?.views ?? 0) + row.views });
    }

    return {
      current,
      previous,
      daily: [...daily].map(([day, views]) => ({ day, views })),
      pages: [...pages.values()].sort((a, b) => b.views - a.views),
    };
  });

  protected readonly periods = visitPeriods;
}
