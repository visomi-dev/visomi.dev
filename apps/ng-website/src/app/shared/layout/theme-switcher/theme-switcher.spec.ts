import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwitcher', () => {
  let component: ThemeSwitcher;
  let fixture: ComponentFixture<ThemeSwitcher>;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ThemeSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the initial icon state without animation classes', () => {
    const lightIcon = fixture.nativeElement.querySelector<SVGElement>('svg.theme-icon:not(.hidden)');
    const darkIcon = fixture.nativeElement.querySelector<SVGElement>('svg.theme-icon.hidden');

    expect(lightIcon).toBeTruthy();
    expect(darkIcon).toBeTruthy();
    expect(lightIcon?.classList.contains('upward-enter')).toBe(false);
    expect(lightIcon?.classList.contains('upward-leave')).toBe(false);
    expect(darkIcon?.classList.contains('upward-enter')).toBe(false);
    expect(darkIcon?.classList.contains('upward-leave')).toBe(false);
  });
});
