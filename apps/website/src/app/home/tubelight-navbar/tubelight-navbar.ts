import { Component, computed, effect, ElementRef, input, signal, viewChildren } from '@angular/core';

export type NavItem = {
  name: string;
  url: string;
  icon: string;
};

@Component({
  selector: 'app-tubelight-navbar',
  imports: [],
  templateUrl: './tubelight-navbar.html',
  styleUrl: './tubelight-navbar.css',
})
export class TubelightNavbar {
  readonly items = input.required<NavItem[]>();
  readonly activeTab = signal('');

  private readonly navItemElements = viewChildren<ElementRef<HTMLElement>>('navItem');

  // Computed position for the lamp
  readonly lampPosition = computed(() => {
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

  setActive(name: string) {
    this.activeTab.set(name);
  }

  readonly itemsInitEffect = effect(
    () => {
      const items = this.items();
      const [firstItem] = items;

      if (firstItem) {
        this.setActive(firstItem.name);
      }

      this.itemsInitEffect.destroy();
    },
    {
      manualCleanup: true,
    },
  );
}
