import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, takeUntil } from 'rxjs';

import { Preferences } from '../../../shared/layout/preferences/preferences';
import { OwnerSession } from '../../session/owner-session';
import { NavigationHeading } from '../../../shared/navigation-heading';

@Component({
  selector: 'app-sign-in',
  imports: [NavigationHeading, FormsModule, Preferences, NgOptimizedImage],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly session = inject(OwnerSession);

  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly challenge = signal(false);
  readonly email = signal('');
  readonly password = signal('');
  readonly code = signal('');
  readonly factor = signal<'email' | 'totp'>('email');
  private readonly csrf = signal('');
  private readonly flowId = signal('');

  async signIn(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      const session = await firstValueFrom(
        this.http.get<{ csrfToken: string }>('/api/auth/session').pipe(takeUntil(this.session.cancelled)),
      );

      this.csrf.set(session.csrfToken);

      const pending = await firstValueFrom(
        this.http
          .post<{ flowId: string; factor: 'email' | 'totp' }>(
            '/api/auth/password/sign-in',
            { email: this.email(), password: this.password() },
            { headers: { 'x-csrf-token': this.csrf() } },
          )
          .pipe(takeUntil(this.session.cancelled)),
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

  restart(): void {
    this.flowId.set('');
    this.code.set('');
    this.password.set('');
    this.challenge.set(false);
    this.failed.set(false);
  }

  async verify(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      await firstValueFrom(
        this.http
          .post(
            '/api/auth/password/verify',
            {
              flowId: this.flowId(),
              factor: { kind: this.factor(), code: this.code() },
            },
            { headers: { 'x-csrf-token': this.csrf() } },
          )
          .pipe(takeUntil(this.session.cancelled)),
      );

      this.code.set('');

      await this.session.signedIn();

      await this.router.navigate(['/admin/dashboard']);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
