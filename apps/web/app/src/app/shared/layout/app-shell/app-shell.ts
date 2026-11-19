import { Location } from '@angular/common';
import { Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { appShell, type ShellLayout } from '@visomi-stack/web-frontend-ui/lib/shell';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  host: { '[class]': 'classes()' },
})
export class AppShell {
  private readonly location = inject(Location);

  readonly layout = input<ShellLayout>('sidebar');
  readonly contentId = input.required<string>();
  readonly skipLabel = input.required<string>();
  readonly sidebarCompact = input(false, { transform: booleanAttribute });

  private readonly path = toSignal(
    new Observable<string>((subscriber) => this.location.onUrlChange(() => subscriber.next(this.location.path()))),
    { initialValue: this.location.path() },
  );

  protected readonly frameClasses = computed(() => appShell.frameClasses({ layout: this.layout() }));
  protected readonly sidebarClasses = computed(() => appShell.sidebarClasses({ layout: this.layout() }));
  protected readonly skipHref = computed(() => {
    // A bare fragment resolves against the localized base, not the current routed page.
    return this.location.prepareExternalUrl(this.path() + '#' + this.contentId());
  });
  protected readonly classes = computed(() => appShell.classes({ compact: this.sidebarCompact() }));

  protected readonly panelClasses = appShell.panelClasses(false);
  protected readonly skipClasses = appShell.skipClasses();
  protected readonly scrollClasses = appShell.scrollClasses();
  protected readonly contentClasses = appShell.contentClasses();
  protected readonly headerClasses = appShell.headerClasses();
  protected readonly mobileClasses = appShell.mobileClasses();

  protected skipToContent(event: MouseEvent, main: HTMLElement): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Keep Angular's route heading focus from taking over on a hash navigation.
    event.preventDefault();
    main.scrollTop = 0;
    main.focus();
  }
}
