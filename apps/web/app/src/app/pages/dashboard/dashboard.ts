import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import type { DashboardData } from './dashboard.resolver';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  private readonly routeData = toSignal(this.route.data);
  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly challenge = signal(false);
  readonly email = signal('');
  readonly password = signal('');
  readonly code = signal('');
  readonly factor = signal<'email' | 'totp'>('email');
  private readonly csrf = signal('');
  private readonly flowId = signal('');

  readonly data = computed<DashboardData>(
    () => (this.routeData()?.['dashboard'] as DashboardData | undefined) ?? { state: 'denied' },
  );

  async signIn(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      const session = await firstValueFrom(this.http.get<{ csrfToken: string }>('/api/auth/session'));

      this.csrf.set(session.csrfToken);

      const pending = await firstValueFrom(
        this.http.post<{ flowId: string; factor: 'email' | 'totp' }>(
          '/api/auth/password/sign-in',
          { email: this.email(), password: this.password() },
          { headers: { 'x-csrf-token': this.csrf() } },
        ),
      );

      this.flowId.set(pending.flowId);
      this.factor.set(pending.factor);
      this.password.set('');
      this.challenge.set(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  async verify(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      await firstValueFrom(
        this.http.post(
          '/api/auth/password/verify',
          {
            flowId: this.flowId(),
            factor: { kind: this.factor(), code: this.code() },
          },
          { headers: { 'x-csrf-token': this.csrf() } },
        ),
      );

      this.code.set('');

      await this.router.navigate(['/dashboard']);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  async signOut(): Promise<void> {
    this.busy.set(true);

    try {
      const session = await firstValueFrom(this.http.get<{ csrfToken: string }>('/api/auth/session'));

      await firstValueFrom(this.http.post('/api/auth/logout', {}, { headers: { 'x-csrf-token': session.csrfToken } }));

      await this.router.navigate(['/access']);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
