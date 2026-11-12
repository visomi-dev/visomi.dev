import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('private application shell', () => {
  it('renders an empty outlet without exposing contacts or template business UI', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();

    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('router-outlet')).toBeTruthy();
    expect(element.textContent?.trim()).toBe('');
    expect(element.querySelector('form, table, h1')).toBeNull();
  });
});
