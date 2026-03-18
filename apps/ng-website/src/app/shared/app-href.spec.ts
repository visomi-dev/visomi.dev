import { getAppHref, getDeploymentBasePath, getLocaleHref } from './app-href';

describe('app href helpers', () => {
  it('should build root-based app hrefs', () => {
    expect(getDeploymentBasePath('https://example.com/')).toBe('/');
    expect(getAppHref('https://example.com/', '/')).toBe('/');
    expect(getAppHref('https://example.com/', '/resume')).toBe('/resume');
  });

  it('should build GitHub Pages app hrefs from the deployment base path', () => {
    expect(getDeploymentBasePath('https://example.com/visomi.dev/')).toBe('/visomi.dev/');
    expect(getAppHref('https://example.com/visomi.dev/', '/')).toBe('/visomi.dev/');
    expect(getAppHref('https://example.com/visomi.dev/', '/projects')).toBe('/visomi.dev/projects');
  });

  it('should build locale hrefs within a GitHub Pages deployment', () => {
    const documentBaseUri = 'https://example.com/visomi.dev/';

    expect(getLocaleHref(documentBaseUri, '/', 'en')).toBe('/visomi.dev/');
    expect(getLocaleHref(documentBaseUri, '/resume?download=1#top', 'en')).toBe('/visomi.dev/resume?download=1#top');
    expect(getLocaleHref(documentBaseUri, '/resume?download=1#top', 'es')).toBe(
      '/visomi.dev/es/resume?download=1#top',
    );
  });

  it('should switch locale paths from a localized deployment base path', () => {
    const localizedBaseUri = 'https://example.com/visomi.dev/es/';

    expect(getDeploymentBasePath(localizedBaseUri)).toBe('/visomi.dev/');
    expect(getLocaleHref(localizedBaseUri, '/', 'en')).toBe('/visomi.dev/');
    expect(getLocaleHref(localizedBaseUri, '/projects', 'es')).toBe('/visomi.dev/es/projects');
  });
});
