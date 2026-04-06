import { Component, input, signal, ElementRef, viewChildren, computed, afterNextRender } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface NavItem {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="fixed bottom-0 left-1/2 z-50 mb-6 w-fit -translate-x-1/2 sm:top-0 sm:pt-6">
      <div
        class="relative flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-900/40 p-1 shadow-2xl backdrop-blur-xl"
      >
        <!-- Lamp / Active Indicator (CSS Transition) -->
        <div
          class="cubic-bezier(0.34,1.56,0.64,1) pointer-events-none absolute -z-10 h-[calc(100%-8px)] rounded-full border border-blue-500/20 bg-blue-500/10 transition-all duration-500"
          [style.left.px]="lampPosition().left"
          [style.width.px]="lampPosition().width"
          [class.opacity-0]="!initialized()"
          [class.opacity-100]="initialized()"
        >
          <div class="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-blue-400">
            <div class="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-blue-400/20 blur-md"></div>
            <div class="absolute -top-1 h-6 w-8 rounded-full bg-blue-400/20 blur-md"></div>
            <div class="absolute top-0 left-2 h-4 w-4 rounded-full bg-blue-400/20 blur-sm"></div>
          </div>
        </div>

        @for (item of items(); track item.name) {
          <a
            #navItem
            [href]="item.url"
            (click)="setActive(item.name)"
            class="relative flex min-w-[44px] cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 sm:px-6"
            [class.text-white]="activeTab() === item.name"
            [class.text-slate-400]="activeTab() !== item.name"
            [class.hover:text-slate-200]="activeTab() !== item.name"
          >
            <span class="hidden md:inline">{{ item.name }}</span>
            <mat-icon class="!text-[20px] md:hidden">{{ item.icon }}</mat-icon>
          </a>
        }
      </div>
    </div>
  `,
})
export class NavBarComponent {
  items = input.required<NavItem[]>();
  activeTab = signal('');
  initialized = signal(false);

  private navItemElements = viewChildren<ElementRef<HTMLElement>>('navItem');

  // Computed position for the lamp
  lampPosition = computed(() => {
    const active = this.activeTab();
    const items = this.navItemElements();
    const itemList = this.items();

    if (!active || items.length === 0) return { left: 0, width: 0 };

    const activeIndex = itemList.findIndex((i) => i.name === active);
    const activeEl = items[activeIndex]?.nativeElement;

    if (activeEl) {
      return {
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      };
    }

    return { left: 0, width: 0 };
  });

  constructor() {
    afterNextRender(() => {
      // Set initial active tab if not set
      if (!this.activeTab() && this.items().length > 0) {
        this.activeTab.set(this.items()[0].name);
      }

      // Small delay to allow DOM to settle before showing the lamp animation
      setTimeout(() => {
        this.initialized.set(true);
      }, 50);
    });
  }

  setActive(name: string) {
    this.activeTab.set(name);
  }
}
