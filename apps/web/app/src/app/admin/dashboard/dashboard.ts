import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Session } from '../auth/session';
import { NavigationHeading } from '../../shared/navigation-heading';
import { Alert } from '../../ui/feedback/alert';
import { Card } from '../../ui/layout/card';
import { Heading } from '../../ui/typography/heading';
import { Link } from '../../ui/typography/link';
import { Text } from '../../ui/typography/text';

import type { DashboardData } from './dashboard.resolver';

@Component({
  selector: 'app-dashboard',
  imports: [NavigationHeading, RouterLink, Alert, Card, Heading, Link, Text],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly session = inject(Session);

  private readonly routeData = toSignal(inject(ActivatedRoute).data);

  readonly data = computed<DashboardData>(() =>
    this.session.valid()
      ? ((this.routeData()?.['dashboard'] as DashboardData | undefined) ?? { state: 'denied' })
      : { state: 'denied' },
  );
}
