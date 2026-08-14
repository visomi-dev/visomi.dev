import { describe, expect, it, vi } from 'vitest';

vi.mock('./project-screenshot-assets', () => ({
  projectScreenshotAssets: {
    'circular-e': [{ src: '/circular-e-1.png' }, { src: '/circular-e-2.png' }],
    guira: [{ src: '/guira-1.png' }, { src: '/guira-2.png' }, { src: '/guira-3.png' }, { src: '/guira-4.png' }],
    linne: [{ src: '/linne-1.png' }, { src: '/linne-2.png' }, { src: '/linne-3.png' }, { src: '/linne-4.png' }],
    mesada: [{ src: '/mesada-1.png' }, { src: '/mesada-2.png' }, { src: '/mesada-3.png' }, { src: '/mesada-4.png' }],
    'data-go': [
      { src: '/data-go-1.png' },
      { src: '/data-go-2.png' },
      { src: '/data-go-3.png' },
      { src: '/data-go-4.png' },
    ],
  },
}));

import { getSiteContent } from './site-content';

describe('site content', () => {
  it('returns populated english content', () => {
    const content = getSiteContent('en');

    expect(content.home.heroTitleLine1).toBe('Architecting software');
    expect(content.projectsList.length).toBeGreaterThan(0);
    expect(content.featuredProjects).toHaveLength(3);
    expect(content.projectsList[0]?.screenshots[0]?.alt).toBeTruthy();
  });

  it('returns populated spanish content', () => {
    const content = getSiteContent('es');

    expect(content.home.heroTitleLine1).toBe('Software pensado para');
    expect(content.resume.languagesLabel).toBe('06 // Idiomas');
    expect(content.projectsList.length).toBeGreaterThan(0);
    expect(content.featuredProjects).toHaveLength(3);
  });

  it('keeps featured projects aligned with the projects list', () => {
    const english = getSiteContent('en');
    const spanish = getSiteContent('es');

    expect(english.featuredProjects.map((project) => project.slug)).toEqual(['guira', 'linne', 'data-go']);
    expect(spanish.featuredProjects.map((project) => project.slug)).toEqual(['guira', 'linne', 'data-go']);
  });
});
