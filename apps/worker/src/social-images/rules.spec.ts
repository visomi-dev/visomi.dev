import { normalizeSocialImageCard, SOCIAL_IMAGE_RULES } from '@visomi.dev/shared-social-images';

describe('social image rules', () => {
  it('caps supporting highlights and keeps the dominant message compact', () => {
    const card = normalizeSocialImageCard({
      accent:
        'A focused accent line that should remain readable without overpowering the primary statement of the card.',
      cta: 'Review the complete case study now',
      eyebrow: 'VISOMI.DEV / PROJECTS',
      highlights: [
        'Fintech delivery',
        'Platform architecture',
        'Leadership systems',
        'This highlight should not appear',
      ],
      locale: 'en',
      page: 'projects',
      subtitle:
        'Case studies that explain the constraints, architecture moves, and product decisions behind work that had to ship with confidence.',
      title: 'Selected projects built under real delivery pressure and meaningful platform constraints.',
    });

    expect(card.highlights).toHaveLength(3);
    expect(card.title.length).toBeLessThanOrEqual(72);
    expect(card.subtitle.length).toBeLessThanOrEqual(140);
  });

  it('documents the baseline rule set for generated cards', () => {
    expect(SOCIAL_IMAGE_RULES).toContain('Lead with one dominant message.');
    expect(SOCIAL_IMAGE_RULES).toContain('Maintain strong foreground and background contrast.');
  });
});
