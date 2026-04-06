import type { ImageMetadata } from 'astro';

import type { Locale, PageId } from '../i18n/translations';
import circularETwoPhones from '../assets/projects/circular-e/two-phones.png';
import guiraWelcome from '../assets/projects/guira/welcome.png';
import linneHome from '../assets/projects/linne/home.png';
import mesadaWebsite from '../assets/projects/mesada/website.png';

type SeoImage = {
  alt: string;
  image: ImageMetadata;
};

const seoImagesByPage: Record<PageId, Record<Locale, SeoImage>> = {
  contact: {
    en: {
      alt: 'Contact page preview for VISOMI.DEV',
      image: mesadaWebsite,
    },
    es: {
      alt: 'Vista previa de la pagina de contacto de VISOMI.DEV',
      image: mesadaWebsite,
    },
  },
  home: {
    en: {
      alt: 'VISOMI.DEV home page preview',
      image: guiraWelcome,
    },
    es: {
      alt: 'Vista previa del inicio de VISOMI.DEV',
      image: guiraWelcome,
    },
  },
  journey: {
    en: {
      alt: 'Career journey page preview for VISOMI.DEV',
      image: linneHome,
    },
    es: {
      alt: 'Vista previa de la pagina de trayectoria de VISOMI.DEV',
      image: linneHome,
    },
  },
  projects: {
    en: {
      alt: 'Projects case studies preview for VISOMI.DEV',
      image: circularETwoPhones,
    },
    es: {
      alt: 'Vista previa de casos de estudio de VISOMI.DEV',
      image: circularETwoPhones,
    },
  },
  resume: {
    en: {
      alt: 'Resume page preview for VISOMI.DEV',
      image: guiraWelcome,
    },
    es: {
      alt: 'Vista previa del resume de VISOMI.DEV',
      image: guiraWelcome,
    },
  },
};

const getSeoImage = (page: PageId, locale: Locale) => seoImagesByPage[page][locale];

export { getSeoImage };
