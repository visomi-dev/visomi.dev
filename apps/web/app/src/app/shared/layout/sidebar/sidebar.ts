import { Component, input } from '@angular/core';

import { sidebar } from '@visomi-stack/web-frontend-ui/lib/shell';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: { role: 'complementary', '[class]': 'classes' },
})
export class Sidebar {
  readonly label = input.required<string>();

  protected readonly classes = sidebar.classes();
  protected readonly navigationClasses = sidebar.navigationClasses();
}
