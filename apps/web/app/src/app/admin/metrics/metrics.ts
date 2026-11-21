import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import type { BrowserErrorCode } from '@visomi-stack/web-shared-observability/lib/contract';

import { Session } from '../auth/session';
import { Button } from '../../ui/actions/button';
import { DescriptionList } from '../../ui/data/description-list';
import { Alert } from '../../ui/feedback/alert';
import { Card } from '../../ui/layout/card';
import { Disclosure } from '../../ui/overlays/disclosure';
import { Code } from '../../ui/typography/code';
import { Heading } from '../../ui/typography/heading';
import { Text } from '../../ui/typography/text';

import type { MetricsData } from './metrics.resolver';

@Component({
  selector: 'app-metrics',
  imports: [DatePipe, DecimalPipe, Button, DescriptionList, Alert, Card, Disclosure, Code, Heading, Text],
  templateUrl: './metrics.html',
  styleUrl: './metrics.css',
})
export class Metrics {
  private readonly session = inject(Session);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeData = toSignal(this.route.data);
  readonly refreshing = signal(false);

  readonly snapshot = computed(() => {
    const data = this.routeData()?.['metrics'] as MetricsData | undefined;

    return this.session.valid() && data?.state === 'ready' ? data.snapshot : null;
  });

  protected readonly reportGuidance = {
    startup_failed: $localize`:@@browserDiagnosticsStartupGuidance:The app reported a failure during startup. Check whether the affected screen can open.`,
    request_failed: $localize`:@@browserDiagnosticsRequestGuidance:A browser request failed. Check whether the action on the affected screen can complete.`,
    unhandled_exception: $localize`:@@browserDiagnosticsExceptionGuidance:The browser reported an unhandled exception. Reproduce the affected action if the error repeats or interrupts a task.`,
    unhandled_rejection: $localize`:@@browserDiagnosticsRejectionGuidance:An asynchronous browser operation failed. Reproduce the affected action if the error repeats or interrupts a task.`,
  } satisfies Record<BrowserErrorCode, string>;

  async refresh(): Promise<void> {
    this.refreshing.set(true);

    try {
      await this.router.navigate([], { relativeTo: this.route, queryParams: { refresh: Date.now() } });
    } finally {
      this.refreshing.set(false);
    }
  }
}
