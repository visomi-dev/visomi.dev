import { Component } from '@angular/core';

import { topbar } from '@visomi-stack/web-frontend-ui/lib/shell';

@Component({
  selector: 'header[app-topbar]',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  host: { '[class]': 'classes' },
})
export class Topbar {
  protected readonly classes = topbar.classes();
  protected readonly titleClasses = topbar.titleClasses();
  protected readonly actionsClasses = topbar.actionsClasses();
}
