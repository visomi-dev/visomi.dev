import { describe, expect, it } from 'vitest';

import { createTranslator, defaultLocale, getPagePath, locales, stripHtml } from './translations';

describe('translations', () => {
  it('exposes the supported locales', () => {
    expect(defaultLocale).toBe('en');
    expect(locales).toEqual(['en', 'es']);
  });

  it('creates locale-aware translators', () => {
    const translateEn = createTranslator('en');
    const translateEs = createTranslator('es');

    expect(translateEn('navHome')).toBe('// HOME');
    expect(translateEs('navHome')).toBe('// INICIO');
  });

  it('builds page paths for the default and translated locales', () => {
    expect(getPagePath('en', 'home')).toBe('/');
    expect(getPagePath('en', 'projects')).toBe('/projects/');
    expect(getPagePath('es', 'resume')).toBe('/es/resume/');
  });

  it('strips html tags from rich strings', () => {
    expect(stripHtml('<strong>Hello</strong>   <em>world</em>')).toBe('Hello world');
  });
});
