import { Component, DestroyRef, LOCALE_ID, afterNextRender, inject, signal } from '@angular/core';

import { browserPrivacyCopy } from '@visomi-stack/web-shared-observability/lib/privacy-copy';

import { Button } from '../../ui/actions/button';
import { Link } from '../../ui/typography/link';
import { Text } from '../../ui/typography/text';

import { BROWSER_ERROR_REPORTER } from './browser-telemetry';

@Component({
  selector: 'app-consent-notice',
  imports: [Button, Link, Text],
  templateUrl: './consent-notice.html',
  styleUrl: './consent-notice.css',
})
export class ConsentNotice {
  private readonly consent = inject(BROWSER_ERROR_REPORTER, { optional: true })?.consent;
  private readonly destroyRef = inject(DestroyRef);
  private readonly locale = inject(LOCALE_ID).startsWith('es') ? 'es' : 'en';

  protected readonly visible = signal(false);
  protected readonly blocked = signal(false);
  protected readonly feedback = signal('');

  protected readonly copy = browserPrivacyCopy[this.locale];

  protected choose(accepted: boolean): void {
    this.consent?.decide(accepted);
  }

  private readonly initialize = afterNextRender(() => {
    const consent = this.consent;

    if (consent) {
      const sync = () => {
        this.blocked.set(consent.blocked());
        this.feedback.set(
          consent.blocked()
            ? this.copy.blocked
            : consent.permit()
              ? this.copy.on
              : consent.decided()
                ? this.copy.off
                : '',
        );
      };

      this.visible.set(!consent.decided());
      this.destroyRef.onDestroy(consent.subscribe(sync));
      sync();
    }
  });
}
