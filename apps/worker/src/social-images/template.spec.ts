import { normalizeSocialImageCard, renderSocialImageHtml  } from '@visomi.dev/shared-social-images';

describe('renderSocialImageHtml', () => {
  it('renders a standalone HTML document for a social image card', () => {
    const html = renderSocialImageHtml(
      normalizeSocialImageCard({
        accent: 'Senior engineering for products that need clear foundations and durable systems.',
        cta: 'Explore the portfolio',
        eyebrow: 'VISOMI.DEV / HOME',
        highlights: ['Scalable platforms', 'AI workflows', 'Technical leadership'],
        locale: 'en',
        page: 'home',
        subtitle: 'Senior full-stack engineering, reusable architecture, and AI-enabled workflows.',
        title: 'Architecting software that ships and scales.',
      }),
    );

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('1200×630');
    expect(html).toContain('VISOMI.DEV');
    expect(html).toContain('Scalable platforms');
  });
});
