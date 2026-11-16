import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Directive({ selector: '[appNavigationHeading]', host: { tabindex: '-1' } })
export class NavigationHeading {
  private readonly router = inject(Router);
  private readonly lifetime = inject(DestroyRef);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly focusHeading = afterNextRender(() => {
    this.host.nativeElement.focus({ preventScroll: true });
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.lifetime),
      )
      .subscribe(() => this.host.nativeElement.focus({ preventScroll: true }));
  });
}
