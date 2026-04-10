import type { SocialImageCardInput, SocialImageCardModel } from './types';

const SOCIAL_IMAGE_RULES = [
  'Always render at 1200 x 630.',
  'Lead with one dominant message.',
  'Keep the headline large enough for small previews.',
  'Maintain strong foreground and background contrast.',
  'Keep branding visible but secondary.',
  'Use page-specific copy instead of one generic card.',
  'Limit support details to a few short highlights.',
  'Keep the layout simple and visually blocked.',
];

const clampText = (value: string, maxLength: number) => {
  const normalizedValue = value.replace(/\s+/g, ' ').trim();

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 1).trimEnd()}…`;
};

const normalizeSocialImageCard = (card: SocialImageCardInput): SocialImageCardModel => ({
  ...card,
  accent: clampText(card.accent, 96),
  brandLabel: 'VISOMI.DEV',
  cta: clampText(card.cta, 26),
  footerLabel: card.locale === 'es' ? 'ingenieria de software' : 'software engineering',
  highlights: card.highlights.map((highlight) => clampText(highlight, 28)).slice(0, 3),
  previewLabel: card.locale === 'es' ? 'vista previa' : 'preview state',
  subtitle: clampText(card.subtitle, 140),
  title: clampText(card.title, 72),
  toneLabel: card.locale === 'es' ? 'claro, tecnico y enfocado' : 'clear, technical, focused',
});

export { SOCIAL_IMAGE_RULES, normalizeSocialImageCard };
