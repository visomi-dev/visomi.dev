import type { Locale, PageId } from './types';

type SocialImageContent = {
  accent: string;
  cta: string;
  eyebrow: string;
  highlights: string[];
  subtitle: string;
  title: string;
};

const socialImageContentByPage: Record<PageId, Record<Locale, SocialImageContent>> = {
  contact: {
    en: {
      accent: 'Direct line for architecture, advisory, and product collaboration.',
      cta: 'Start the conversation',
      eyebrow: 'VISOMI.DEV / CONTACT',
      highlights: ['Architecture consulting', 'Technical leadership', 'Fast response'],
      subtitle: 'Architecture consulting, technical leadership, and high-impact product collaboration.',
      title: 'Initialize connection.',
    },
    es: {
      accent: 'Canal directo para arquitectura, advisory y colaboracion de producto.',
      cta: 'Iniciar conversacion',
      eyebrow: 'VISOMI.DEV / CONTACTO',
      highlights: ['Consultoria tecnica', 'Liderazgo', 'Respuesta rapida'],
      subtitle: 'Consultoria de arquitectura, liderazgo tecnico y colaboracion en productos de alto impacto.',
      title: 'Iniciemos la conexion.',
    },
  },
  home: {
    en: {
      accent: 'Senior engineering for products that need clear foundations and durable systems.',
      cta: 'Explore the portfolio',
      eyebrow: 'VISOMI.DEV / HOME',
      highlights: ['Scalable platforms', 'AI workflows', 'Technical leadership'],
      subtitle: 'Senior full-stack engineering, reusable architecture, and AI-enabled workflows.',
      title: 'Architecting software that ships and scales.',
    },
    es: {
      accent: 'Ingenieria senior para productos que necesitan bases claras y sistemas duraderos.',
      cta: 'Explorar portafolio',
      eyebrow: 'VISOMI.DEV / INICIO',
      highlights: ['Plataformas escalables', 'Flujos con IA', 'Liderazgo tecnico'],
      subtitle: 'Ingenieria full-stack senior, arquitectura reutilizable y flujos de trabajo potenciados por IA.',
      title: 'Software pensado para salir a produccion y escalar.',
    },
  },
  journey: {
    en: {
      accent: 'From fintech to internal platforms, with the architecture decisions behind the work.',
      cta: 'See the timeline',
      eyebrow: 'VISOMI.DEV / JOURNEY',
      highlights: ['Fintech', 'Internal platforms', 'Leadership'],
      subtitle: 'A career timeline across fintech, internal platforms, product systems, and technical leadership.',
      title: 'Engineering journey through scale, teams, and platforms.',
    },
    es: {
      accent: 'De fintech a plataformas internas, con las decisiones de arquitectura detras del trabajo.',
      cta: 'Ver la linea de tiempo',
      eyebrow: 'VISOMI.DEV / TRAYECTORIA',
      highlights: ['Fintech', 'Plataformas internas', 'Liderazgo'],
      subtitle: 'Una linea de tiempo entre fintech, plataformas internas, sistemas de producto y liderazgo tecnico.',
      title: 'Trayectoria en escala, equipos y plataformas.',
    },
  },
  projects: {
    en: {
      accent: 'Editorial case studies covering delivery constraints, interface decisions, and system design.',
      cta: 'Open the case studies',
      eyebrow: 'VISOMI.DEV / PROJECTS',
      highlights: ['Fintech', 'SaaS', 'Product architecture'],
      subtitle: 'Case studies across fintech, SaaS, internal tools, and scalable product architecture.',
      title: 'Selected projects built with real delivery constraints.',
    },
    es: {
      accent: 'Casos de estudio editoriales con restricciones reales, decisiones de interfaz y diseno de sistemas.',
      cta: 'Abrir casos de estudio',
      eyebrow: 'VISOMI.DEV / PROYECTOS',
      highlights: ['Fintech', 'SaaS', 'Arquitectura de producto'],
      subtitle: 'Casos de estudio en fintech, SaaS, herramientas internas y arquitectura de producto escalable.',
      title: 'Proyectos seleccionados construidos con restricciones reales de entrega.',
    },
  },
  resume: {
    en: {
      accent: 'A focused snapshot of roles, leadership, and engineering depth across multiple product stages.',
      cta: 'Review the resume',
      eyebrow: 'VISOMI.DEV / RESUME',
      highlights: ['Experience', 'Leadership', 'Systems thinking'],
      subtitle: 'Experience, leadership, systems thinking, and delivery across multiple product stages.',
      title: 'Resume and experience snapshot.',
    },
    es: {
      accent: 'Un resumen claro de experiencia, liderazgo y profundidad tecnica en distintas etapas de producto.',
      cta: 'Revisar curriculum',
      eyebrow: 'VISOMI.DEV / CURRICULUM',
      highlights: ['Experiencia', 'Liderazgo', 'Pensamiento sistemico'],
      subtitle: 'Experiencia, liderazgo, pensamiento sistemico y ejecucion a traves de multiples etapas de producto.',
      title: 'Resumen de experiencia profesional.',
    },
  },
};

const getSocialImageContent = (page: PageId, locale: Locale) => socialImageContentByPage[page][locale];

export { getSocialImageContent };
