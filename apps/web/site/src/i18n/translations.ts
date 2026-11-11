import en from './en.json';
import es from './es.json';

export const defaultLocale = 'en';
export const locales = ['en', 'es'] as const;

export type Locale = (typeof locales)[number];
export type PageId = 'home' | 'journey' | 'projects' | 'resume' | 'contact';

const translations = {
  en,
  es,
} as const;

export type TranslationKey = keyof typeof translations.en;

const pageSegments: Record<PageId, string> = {
  home: '',
  journey: 'journey',
  projects: 'projects',
  resume: 'resume',
  contact: 'contact',
};
const basePath = import.meta.env.BASE_URL;

export const createTranslator = (locale: Locale) => {
  const dictionary = translations[locale];

  return (key: TranslationKey) => dictionary[key];
};

export const getPagePath = (locale: Locale, page: PageId) => {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const segment = pageSegments[page];
  const path = segment ? `${prefix}/${segment}/` : `${prefix}/`;

  if (basePath === '/') {
    return path.replaceAll('//', '/');
  }

  return `${basePath}${path.slice(1)}`.replaceAll('//', '/');
};

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
