import { Component, LOCALE_ID, inject } from '@angular/core';

import { browserPrivacyCopy } from '@visomi-stack/web-shared-observability/lib/privacy-copy';

import { Link } from '../../ui/typography/link';

@Component({
  selector: 'app-privacy-link',
  imports: [Link],
  templateUrl: './privacy-link.html',
  styleUrl: './privacy-link.css',
})
export class PrivacyLink {
  protected readonly copy = browserPrivacyCopy[inject(LOCALE_ID).startsWith('es') ? 'es' : 'en'];
}
