import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OwnerSession } from '../../auth/session/owner-session';
import { NavigationHeading } from '../../shared/navigation-heading';

import type { DashboardData } from './dashboard.resolver';

@Component({
  selector: 'app-dashboard',
  imports: [NavigationHeading, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly session = inject(OwnerSession);

  private readonly routeData = toSignal(inject(ActivatedRoute).data);

  readonly data = computed<DashboardData>(() =>
    this.session.valid()
      ? ((this.routeData()?.['dashboard'] as DashboardData | undefined) ?? { state: 'denied' })
      : { state: 'denied' },
  );
}
