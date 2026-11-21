import { Location, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, afterRenderEffect, inject, signal, untracked, viewChild, type ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, takeUntil } from 'rxjs';

import { loader } from '@visomi-stack/web-frontend-ui/lib/feedback';

import { Field } from '../../../../shared/field/field';
import { Preferences } from '../../../../shared/layout/preferences/preferences';
import { PinInput } from '../../../../shared/pin-input/pin-input';
import { Button } from '../../../../ui/actions/button';
import { Alert } from '../../../../ui/feedback/alert';
import { Input } from '../../../../ui/forms/input';
import { Card } from '../../../../ui/layout/card';
import { Heading } from '../../../../ui/typography/heading';
import { Link } from '../../../../ui/typography/link';
import { Text } from '../../../../ui/typography/text';
import { Session } from '../../session';
import { ConsentNotice } from '../../../../shared/observability/consent-notice/consent-notice';

@Component({
  selector: 'app-sign-in',
  imports: [
    ConsentNotice,
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
    Link,
    Text,
  ],
  templateUrl: './password.html',
  styleUrl: './password.css',
})
export class Password {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);
  protected readonly restartHref = inject(Location).prepareExternalUrl('/admin/auth/sign-in');

  private readonly pin = viewChild(PinInput);

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

  protected readonly loaderClasses = loader.classes();
  protected readonly passwordShow = $localize`:@@signInPasswordShow:Show`;
  protected readonly passwordHide = $localize`:@@signInPasswordHide:Hide`;
  protected readonly codeLabel = $localize`:@@dashboardAccessCode:Verification code`;
  protected readonly emailLabel = $localize`:@@dashboardAccessEmail:Verified email`;
  protected readonly passwordLabel = $localize`:@@dashboardAccessPassword:Password`;
  protected readonly failureMessage = $localize`:@@dashboardAccessError:Access could not be verified. Please try again.`;

  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');

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

  restart(event: MouseEvent): void {
    if (this.busy()) {
      event.preventDefault();

      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.flowId.set('');
    this.code.set('');
    this.password.set('');
    this.challenge.set(false);
    this.failed.set(false);
  }

  setCode(value: string): void {
    const code = value.replace(/[^0-9]/g, '').slice(0, 6);

    if (!this.challenge() || this.busy() || code === this.code()) {
      return;
    }

    this.code.set(code);
    this.failed.set(false);

    if (code.length === 6) {
      void this.verify(code);
    }
  }

  private async verify(code: string): Promise<void> {
    this.busy.set(true);
    this.failed.set(false);

    try {
      await firstValueFrom(
        this.http
          .post(
            '/api/auth/password/verify',
            {
              flowId: this.flowId(),
              factor: { kind: this.factor(), code },
            },
            { headers: { 'x-csrf-token': this.csrf() } },
          )
          .pipe(takeUntil(this.session.cancelled)),
      );

      this.code.set('');

      await this.session.signedIn();

      await this.router.navigate(['/admin/dashboard']);
    } catch {
      this.code.set('');
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private readonly focusPin = afterRenderEffect({
    write: () => this.pin()?.focus(),
  });

  private readonly focusRestartedForm = afterRenderEffect({
    write: () => {
      const passwordInput = this.passwordInput();

      // Returning from the PIN keeps the verified email. Leave focus alone on initial entry.
      if (passwordInput && untracked(this.email)) {
        passwordInput.nativeElement.focus();
      }
    },
  });
}
