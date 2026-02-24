import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
  viewChildren,
  type ElementRef,
  type TemplateRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

export interface NavItem {
  name: string;
  url: string;
  icon?: TemplateRef<{ $implicit: NavItem }>;
}

@Component({
  selector: 'app-tubelight-navbar',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './tubelight-navbar.html',
  styleUrl: './tubelight-navbar.css',
  host: {
    class: /* tw */ 'fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:pt-6 block',
    '[class]': 'hostClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TubelightNavbar {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = input.required<NavItem[]>();
  readonly extraClass = input<string>('');
  readonly iconTemplate = input<TemplateRef<{ $implicit: NavItem }> | undefined>(undefined);

  readonly navContainer = viewChild<ElementRef<HTMLElement>>('navContainer');
  readonly navItems = viewChildren<ElementRef<HTMLElement>>('navItem');

  readonly activeTab = signal<string>('');
  readonly activeIndex = computed(() =>
    Math.max(0, this.items().findIndex((i) => i.name === this.activeTab())));
  readonly isMobile = signal(false);
  readonly lampPosition = signal({ left: 0, width: 0 });

  private updateLampPosition = (): void => {
    if (!isPlatformBrowser(this.platformId)) return;
    const container = this.navContainer()?.nativeElement;
    const refs = this.navItems();
    const idx = this.activeIndex();
    if (!container || idx < 0 || idx >= refs.length) return;
    const rect = container.getBoundingClientRect();
    const itemEl = refs[idx].nativeElement.getBoundingClientRect();
    this.lampPosition.set({
      left: itemEl.left - rect.left,
      width: itemEl.width,
    });
  };

  private resizeListener = (): void => {
    this.isMobile.set(window.innerWidth < 768);
    this.updateLampPosition();
  };

  constructor() {
    effect(
      () => {
        const list = this.items();
        const current = this.activeTab();
        if (list.length && !list.some((i) => i.name === current)) {
          this.activeTab.set(list[0].name);
        } else if (list.length && !current) {
          this.activeTab.set(list[0].name);
        }
      }
    );

    effect(() => {
      this.activeIndex();
      this.items();
      if (isPlatformBrowser(this.platformId)) {
        queueMicrotask(() => this.updateLampPosition());
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth < 768);
      window.addEventListener('resize', this.resizeListener);
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', this.resizeListener));
    }

    afterNextRender(
      () => {
        this.updateLampPosition();
      },
      { injector: this.injector }
    );
  }

  readonly hostClass = computed(() => this.extraClass());

  setActive(name: string): void {
    this.activeTab.set(name);
  }
}
