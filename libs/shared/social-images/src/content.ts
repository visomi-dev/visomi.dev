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
      accent: 'Un canal directo para conversar sobre arquitectura, producto y decisiones tecnicas clave.',
      cta: 'Conversemos',
      eyebrow: 'VISOMI.DEV / CONTACTO',
      highlights: ['Arquitectura de software', 'Liderazgo tecnico', 'Respuesta agil'],
      subtitle: 'Arquitectura de software, liderazgo tecnico y colaboracion en productos con impacto real.',
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
      accent: 'Ingenieria senior para productos que necesitan bases solidas, claridad tecnica y sistemas duraderos.',
      cta: 'Explorar portafolio',
      eyebrow: 'VISOMI.DEV / INICIO',
      highlights: ['Plataformas escalables', 'Flujos con IA', 'Direccion tecnica'],
      subtitle: 'Ingenieria full-stack senior, arquitectura reutilizable y flujos de trabajo potenciados por IA.',
      title: 'Software listo para producir impacto y escalar.',
    },
  },
  journey: {
    en: {
      accent: 'Work across fintech and internal platforms, guided by the architecture behind each system.',
      cta: 'See the timeline',
      eyebrow: 'VISOMI.DEV / JOURNEY',
      highlights: ['Fintech', 'Internal platforms', 'Leadership'],
      subtitle: 'A career timeline across fintech, internal platforms, product systems, and technical leadership.',
      title: 'Engineering across scale, teams, and platforms.',
    },
    es: {
      accent: 'Un recorrido entre fintech y plataformas internas, guiado por decisiones de arquitectura con contexto.',
      cta: 'Ver trayectoria',
      eyebrow: 'VISOMI.DEV / TRAYECTORIA',
      highlights: ['Fintech', 'Plataformas internas', 'Liderazgo tecnico'],
      subtitle: 'Una trayectoria entre fintech, plataformas internas, sistemas de producto y liderazgo tecnico.',
      title: 'Trayectoria en escala, equipos y plataformas.',
    },
  },
  projects: {
    en: {
      accent: 'Editorial case studies shaped by delivery constraints, interface choices, and practical system design.',
      cta: 'Open the case studies',
      eyebrow: 'VISOMI.DEV / PROJECTS',
      highlights: ['Fintech', 'SaaS', 'Product architecture'],
      subtitle: 'Case studies across fintech, SaaS, internal tools, and scalable product architecture.',
      title: 'Selected projects under real delivery constraints.',
    },
    es: {
      accent: 'Casos de estudio construidos desde restricciones reales, decisiones de interfaz y diseno de sistemas.',
      cta: 'Ver casos de estudio',
      eyebrow: 'VISOMI.DEV / PROYECTOS',
      highlights: ['Fintech', 'SaaS', 'Arquitectura de producto'],
      subtitle: 'Casos de estudio sobre fintech, SaaS, herramientas internas y arquitectura de producto escalable.',
      title: 'Proyectos con restricciones reales de entrega.',
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
      accent: 'Una vista clara de experiencia, liderazgo y criterio tecnico en distintas etapas de producto.',
      cta: 'Ver experiencia',
      eyebrow: 'VISOMI.DEV / EXPERIENCIA',
      highlights: ['Experiencia', 'Liderazgo', 'Vision sistemica'],
      subtitle: 'Experiencia, liderazgo, vision sistemica y ejecucion en distintas etapas de producto.',
      title: 'Resumen de experiencia profesional.',
    },
  },
};

const getSocialImageContent = (page: PageId, locale: Locale) => socialImageContentByPage[page][locale];

export { getSocialImageContent };
