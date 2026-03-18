import { DOCUMENT } from '@angular/common';
import { computed, Component, inject } from '@angular/core';

import { getAppHref } from '../../../shared/app-href';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  host: {
    class: /* tw */ 'relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center',
  },
})
export class Hero {
  private readonly document = inject(DOCUMENT);

  readonly resumeHref = computed(() => getAppHref(this.document.baseURI, '/resume'));
}
