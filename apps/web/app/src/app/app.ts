import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { PageLoader } from './shared/layout/page-loader/page-loader';
import { ThemeHost } from './shared/layout/theme-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageLoader],
  hostDirectives: [ThemeHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  private readonly rendered = signal(false);

  protected readonly loading = computed(() => this.rendered() && this.router.currentNavigation() !== null);

  private readonly initialize = afterNextRender(() => this.rendered.set(true));
}
