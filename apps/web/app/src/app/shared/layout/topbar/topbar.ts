import { Component, booleanAttribute, computed, input } from '@angular/core';

import { topbar } from '@visomi-stack/web-frontend-ui/lib/shell';

@Component({
  selector: 'header[app-topbar]',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  host: { '[class]': 'classes()' },
})
export class Topbar {
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => topbar.classes({ compact: this.compact() }));

  protected readonly titleClasses = topbar.titleClasses();
  protected readonly actionsClasses = topbar.actionsClasses();
}
