import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { Background } from './background';

describe('Background', () => {
  let component: Background;
  let fixture: ComponentFixture<Background>;
  let httpTestingController: HttpTestingController;

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
    await TestBed.configureTestingModule({
      imports: [Background],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Background);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const vertReq = httpTestingController.expectOne('/assets/home/background/background.vert');
    vertReq.flush('void main() {}');

    const fragReq = httpTestingController.expectOne('/assets/home/background/background.frag');
    fragReq.flush('void main() {}');

    await fixture.whenStable();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the initial background state without animation classes', () => {
    const lightBackground = fixture.nativeElement.querySelector<HTMLElement>('div.bg-neutral-50');
    const darkBackground = fixture.nativeElement.querySelector<HTMLElement>('div.bg-black');

    expect(lightBackground).toBeTruthy();
    expect(darkBackground).toBeTruthy();
    expect(lightBackground?.classList.contains('bg-upward-enter')).toBe(false);
    expect(lightBackground?.classList.contains('bg-upward-leave')).toBe(false);
    expect(darkBackground?.classList.contains('bg-upward-enter')).toBe(false);
    expect(darkBackground?.classList.contains('bg-upward-leave')).toBe(false);
    expect(lightBackground?.classList.contains('hidden')).toBe(false);
    expect(darkBackground?.classList.contains('hidden')).toBe(true);
  });
});
