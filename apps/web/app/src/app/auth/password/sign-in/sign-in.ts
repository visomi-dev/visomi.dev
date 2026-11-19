import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, takeUntil } from 'rxjs';

import { Field } from '../../../shared/field/field';
import { Preferences } from '../../../shared/layout/preferences/preferences';
import { NavigationHeading } from '../../../shared/navigation-heading';
import { PinInput } from '../../../shared/pin-input/pin-input';
import { Button } from '../../../ui/actions/button';
import { Alert } from '../../../ui/feedback/alert';
import { Input } from '../../../ui/forms/input';
import { Card } from '../../../ui/layout/card';
import { Heading } from '../../../ui/typography/heading';
import { Text } from '../../../ui/typography/text';
import { OwnerSession } from '../../session/owner-session';
import { ConsentNotice } from '../../../shared/observability/consent-notice';
import { PrivacyLink } from '../../../shared/observability/privacy-link';

@Component({
  selector: 'app-sign-in',
  imports: [
    ConsentNotice,
    PrivacyLink,
    NavigationHeading,
    FormsModule,
    Preferences,
    NgOptimizedImage,
    Field,
    PinInput,
    Button,
    Alert,
    Input,
    Card,
    Heading,
    Text,
  ],
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
  protected readonly passwordVisible = signal(false);
  readonly code = signal('');
  readonly factor = signal<'email' | 'totp'>('email');
  private readonly csrf = signal('');
  private readonly flowId = signal('');

  protected readonly validCode = computed(() => /^[0-9]{6}$/.test(this.code()));

  protected readonly passwordShow = $localize`:@@signInPasswordShow:Show`;
  protected readonly passwordHide = $localize`:@@signInPasswordHide:Hide`;
  protected readonly codeLabel = $localize`:@@dashboardAccessCode:Verification code`;
  protected readonly emailLabel = $localize`:@@dashboardAccessEmail:Verified email`;
  protected readonly passwordLabel = $localize`:@@dashboardAccessPassword:Password`;
  protected readonly failureMessage = $localize`:@@dashboardAccessError:Access could not be verified. Please try again.`;

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
      this.passwordVisible.set(false);
      this.challenge.set(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  restart(): void {
    this.flowId.set('');
    this.code.set('');
    this.password.set('');
    this.challenge.set(false);
    this.failed.set(false);
  }

  setCode(value: string): void {
    this.code.set(value.replace(/[^0-9]/g, '').slice(0, 6));
    this.failed.set(false);
  }

  async verify(): Promise<void> {
    if (this.busy() || !this.validCode()) {
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
