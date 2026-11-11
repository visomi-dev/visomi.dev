import type { Locale, PageId } from '../i18n/translations';

type SeoImage = {
  alt: string;
  image: string;
};

const IMAGE_VERSION = '2026-04-10';

const appendVersion = (path: string) => `${path}?v=${IMAGE_VERSION.replace(/\//g, '.')}`;

const seoImagesByPage: Record<PageId, Record<Locale, SeoImage>> = {
  contact: {
    en: {
      alt: 'Contact page preview for VISOMI.DEV',
      image: appendVersion('/images/seo/en/contact.png'),
    },
    es: {
      alt: 'Vista previa de la pagina de contacto de VISOMI.DEV',
      image: appendVersion('/images/seo/es/contact.png'),
    },
  },
  home: {
    en: {
      alt: 'VISOMI.DEV home page preview',
      image: appendVersion('/images/seo/en/home.png'),
    },
    es: {
      alt: 'Vista previa del inicio de VISOMI.DEV',
      image: appendVersion('/images/seo/es/home.png'),
    },
  },
  journey: {
    en: {
      alt: 'Career journey page preview for VISOMI.DEV',
      image: appendVersion('/images/seo/en/journey.png'),
    },
    es: {
      alt: 'Vista previa de la pagina de trayectoria de VISOMI.DEV',
      image: appendVersion('/images/seo/es/journey.png'),
    },
  },
  projects: {
    en: {
      alt: 'Projects case studies preview for VISOMI.DEV',
      image: appendVersion('/images/seo/en/projects.png'),
    },
    es: {
      alt: 'Vista previa de casos de estudio de VISOMI.DEV',
      image: appendVersion('/images/seo/es/projects.png'),
    },
  },
  resume: {
    en: {
      alt: 'Resume page preview for VISOMI.DEV',
      image: appendVersion('/images/seo/en/resume.png'),
    },
    es: {
      alt: 'Vista previa del resume de VISOMI.DEV',
      image: appendVersion('/images/seo/es/resume.png'),
    },
  },
};

const getSeoImage = (page: PageId, locale: Locale) => seoImagesByPage[page][locale];

export { getSeoImage };
