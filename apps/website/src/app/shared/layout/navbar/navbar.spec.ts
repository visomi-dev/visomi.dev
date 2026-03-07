import '@angular/localize/init';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { Navbar } from './navbar';

describe('Navbar', () => {
  const setup = async (locale = 'en-US') => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), { provide: LOCALE_ID, useValue: locale }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Navbar);
    const component = fixture.componentInstance;

    await fixture.whenStable();

    return { fixture, component };
  };

  it('should create', async () => {
    const { component, fixture } = await setup();

    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should generate locale links for english locale', async () => {
    const { component } = await setup('en-US');

    expect(component.englishHref()).toBe('/');
    expect(component.spanishHref()).toBe('/es/');
    expect(component.getLocaleLinkClass('en')).toContain('pointer-events-none');
    expect(component.getLocaleLinkClass('es')).not.toContain('pointer-events-none');
  });

  it('should disable spanish link for spanish locale', async () => {
    const { component } = await setup('es');

    expect(component.englishHref()).toBe('/');
    expect(component.spanishHref()).toBe('/es/');
    expect(component.getLocaleLinkClass('es')).toContain('pointer-events-none');
    expect(component.getLocaleLinkClass('en')).not.toContain('pointer-events-none');
  });
});
