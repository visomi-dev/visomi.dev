import type { ImageMetadata } from 'astro';

import type { Locale, PageId } from '../i18n/translations';
import enContactPreview from '../assets/seo/en/contact.png';
import enHomePreview from '../assets/seo/en/home.png';
import enJourneyPreview from '../assets/seo/en/journey.png';
import enProjectsPreview from '../assets/seo/en/projects.png';
import enResumePreview from '../assets/seo/en/resume.png';
import esContactPreview from '../assets/seo/es/contact.png';
import esHomePreview from '../assets/seo/es/home.png';
import esJourneyPreview from '../assets/seo/es/journey.png';
import esProjectsPreview from '../assets/seo/es/projects.png';
import esResumePreview from '../assets/seo/es/resume.png';

type SeoImage = {
  alt: string;
  image: ImageMetadata;
};

const seoImagesByPage: Record<PageId, Record<Locale, SeoImage>> = {
  contact: {
    en: {
      alt: 'Contact page preview for VISOMI.DEV',
      image: enContactPreview,
    },
    es: {
      alt: 'Vista previa de la pagina de contacto de VISOMI.DEV',
      image: esContactPreview,
    },
  },
  home: {
    en: {
      alt: 'VISOMI.DEV home page preview',
      image: enHomePreview,
    },
    es: {
      alt: 'Vista previa del inicio de VISOMI.DEV',
      image: esHomePreview,
    },
  },
  journey: {
    en: {
      alt: 'Career journey page preview for VISOMI.DEV',
      image: enJourneyPreview,
    },
    es: {
      alt: 'Vista previa de la pagina de trayectoria de VISOMI.DEV',
      image: esJourneyPreview,
    },
  },
  projects: {
    en: {
      alt: 'Projects case studies preview for VISOMI.DEV',
      image: enProjectsPreview,
    },
    es: {
      alt: 'Vista previa de casos de estudio de VISOMI.DEV',
      image: esProjectsPreview,
    },
  },
  resume: {
    en: {
      alt: 'Resume page preview for VISOMI.DEV',
      image: enResumePreview,
    },
    es: {
      alt: 'Vista previa del resume de VISOMI.DEV',
      image: esResumePreview,
    },
  },
};

const getSeoImage = (page: PageId, locale: Locale) => seoImagesByPage[page][locale];

export { getSeoImage };
