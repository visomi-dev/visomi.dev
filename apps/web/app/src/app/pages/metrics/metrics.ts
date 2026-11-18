import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { OwnerSession } from '../../auth/session/owner-session';
import { NavigationHeading } from '../../shared/navigation-heading';

import type { MetricsData } from './metrics.resolver';

@Component({
  selector: 'app-metrics',
  imports: [NavigationHeading, DatePipe, DecimalPipe],
  templateUrl: './metrics.html',
  styleUrl: './metrics.css',
})
export class Metrics {
  private readonly session = inject(OwnerSession);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeData = toSignal(this.route.data);
  readonly refreshing = signal(false);

  readonly snapshot = computed(() => {
    const data = this.routeData()?.['metrics'] as MetricsData | undefined;

    return this.session.valid() && data?.state === 'ready' ? data.snapshot : null;
  });

  async refresh(): Promise<void> {
    this.refreshing.set(true);

    try {
      await this.router.navigate([], { relativeTo: this.route, queryParams: { refresh: Date.now() } });
    } finally {
      this.refreshing.set(false);
    }
  }
}
