import { Directive, computed, input } from '@angular/core';

import type { Tone } from '@visomi-stack/web-frontend-ui/lib/data';
import { alert as styles } from '@visomi-stack/web-frontend-ui/lib/feedback';

@Directive({
  selector: 'div[appUI=alert],section[appUI=alert]',
  host: { '[class]': 'classes()' },
})
export class Alert {
  readonly tone = input<Tone>('accent');

  protected readonly classes = computed(() => styles.classes({ tone: this.tone() }));
}
