import { getSocialImageContent } from './content';
import type { SocialImageCardInput, SocialImageTarget } from './types';
import { locales, pages } from './types';

const getAllWebsiteSocialImageTargets = () =>
  locales.flatMap((locale) => pages.map((page) => ({ locale, page }) satisfies SocialImageTarget));

const getWebsiteSocialImageCard = ({ locale, page }: SocialImageTarget): SocialImageCardInput => {
  const content = getSocialImageContent(page, locale);

  return {
    ...content,
    locale,
    page,
  };
};

export { getAllWebsiteSocialImageTargets, getWebsiteSocialImageCard };
