import type { Locale } from '../i18n/translations';

import { enContent } from './content-en';
import { esContent } from './content-es';
import { projects } from './project-content';
import type { SiteContent } from './site-content.type';

const content: Record<Locale, SiteContent> = { en: enContent, es: esContent };

content.en.projectsList = projects.en;
content.en.featuredProjects = [projects.en[0], projects.en[1], projects.en[3]];
content.es.projectsList = projects.es;
content.es.featuredProjects = [projects.es[0], projects.es[1], projects.es[3]];

export const getSiteContent = (locale: Locale) => content[locale];
