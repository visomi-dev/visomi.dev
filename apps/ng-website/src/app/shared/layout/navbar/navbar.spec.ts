import '@angular/localize/init';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { Navbar } from './navbar';

describe('Navbar', () => {
  const setBaseHref = (href: string) => {
    let baseElement = document.querySelector('base');

    if (baseElement == null) {
      baseElement = document.createElement('base');
      document.head.appendChild(baseElement);
    }

    baseElement.setAttribute('href', href);
  };

  const setup = async (locale = 'en-US', baseHref = '/') => {
    setBaseHref(baseHref);

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

    expect(component.homeHref()).toBe('/');
    expect(component.journeyHref()).toBe('/journey');
    expect(component.englishHref()).toBe('/');
    expect(component.spanishHref()).toBe('/es/');
    expect(component.getLocaleLinkClass('en')).toContain('pointer-events-none');
    expect(component.getLocaleLinkClass('es')).not.toContain('pointer-events-none');
  });

  it('should disable spanish link for spanish locale', async () => {
    const { component } = await setup('es', '/es/');

    expect(component.homeHref()).toBe('/es/');
    expect(component.journeyHref()).toBe('/es/journey');
    expect(component.englishHref()).toBe('/');
    expect(component.spanishHref()).toBe('/es/');
    expect(component.getLocaleLinkClass('es')).toContain('pointer-events-none');
    expect(component.getLocaleLinkClass('en')).not.toContain('pointer-events-none');
  });

  it('should keep locale links on nested base paths', async () => {
    const { component } = await setup('es', '/portfolio/es/');

    expect(component.homeHref()).toBe('/portfolio/es/');
    expect(component.projectsHref()).toBe('/portfolio/es/projects');
    expect(component.englishHref()).toBe('/portfolio/');
    expect(component.spanishHref()).toBe('/portfolio/es/');
  });
});
