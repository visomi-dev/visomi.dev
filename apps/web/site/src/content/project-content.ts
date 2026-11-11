import type { ImageMetadata } from 'astro';

import type { Locale } from '../i18n/translations';

import { projectScreenshotAssets } from './project-screenshot-assets';
import type { Project, ProjectScreenshot } from './site-content.type';

const createScreenshots = (assets: ImageMetadata[], alts: string[]): ProjectScreenshot[] =>
  assets.map((src, index) => ({ src, alt: alts[index] ?? '' }));

export const projects: Record<Locale, Project[]> = {
  en: [
    {
      slug: 'guira',
      title: 'LATAM Cross-Border Payments Platform',
      role: 'Software Architect & Full Stack Engineer',
      year: '2025',
      category: 'FINTECH',
      icon: 'pi-send',
      summary:
        'MVP for a fintech platform that lets individuals and businesses in Latin America pay international providers in USD using local-to-USDC conversion and Bridge payouts.',
      technologies: ['React Router v7', 'Supabase', 'Prisma', 'Docker', 'Edge Functions'],
      highlights: [
        { label: 'Focus', value: 'KYC / KYB onboarding' },
        { label: 'Scope', value: 'MVP architecture + admin review' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets.guira, [
        'Guira welcome screen',
        'Guira sign up flow',
        'Guira KYC document step',
        'Guira admin KYC review list',
      ]),
    },
    {
      slug: 'linne',
      title: 'Linne Social Sports Picks Platform',
      role: 'Software Architect & Full Stack Engineer',
      year: '2025',
      category: 'PLATFORM',
      icon: 'pi-video',
      summary:
        'Refactor of an auto-generated social betting product into a production-ready platform with controlled data flows, worker-based processing, and a shared web/mobile experience.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Zustand', 'Capacitor', 'BullMQ'],
      highlights: [
        { label: 'Upgrade', value: 'AI screenshot processing' },
        { label: 'Reach', value: 'Web + mobile stories flow' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets.linne, [
        'Linne home screen',
        'Linne ticket feed',
        'Linne story creation with video',
        'Linne profile history view',
      ]),
    },
    {
      slug: 'mesada',
      title: 'Money Transfers Between the U.S. and Mexico',
      role: 'Full Stack Software Engineer',
      year: '2022',
      category: 'FINTECH',
      icon: 'pi-wallet',
      summary:
        'Migration, maintenance, and deployment work for a remittance platform that improved performance and stability across web and hybrid app surfaces while keeping KYC and transfer flows operational.',
      technologies: ['React', 'React Native', 'Django REST', 'Celery', 'Postgres', 'EC2'],
      highlights: [
        { label: 'Delivery', value: 'App Store + Play Store' },
        { label: 'Outcome', value: 'Legacy upgrade and stabilization' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets.mesada, [
        'Mesada marketing website',
        'Mesada send money flow',
        'Mesada transaction history',
        'Mesada transaction summary',
      ]),
    },
    {
      slug: 'data-go',
      title: 'Omnichannel Call Center SaaS',
      role: 'Software Architect & Full Stack Engineer',
      year: '2024',
      category: 'PLATFORM',
      icon: 'pi-desktop',
      summary:
        'MVP for a call center platform oriented to agents and supervisors, including architecture definition, stack selection, UI design, implementation kickoff, and technical handoff.',
      technologies: ['Angular', 'Express', 'Prisma', 'MySQL', 'AWS Cognito', 'Figma'],
      highlights: [
        { label: 'Focus', value: 'Agent + supervisor operations' },
        { label: 'Handoff', value: 'Docs and team training' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets['data-go'], [
        'Data Go dashboard view',
        'Data Go operational dashboard',
        'Data Go phone workspace',
        'Data Go login screen',
      ]),
    },
    {
      slug: 'circular-e',
      title: 'Circular-E Recycling Pickup Platform',
      role: 'Product Engineer & Technical Partner',
      year: '2023',
      category: 'PLATFORM',
      icon: 'pi-refresh',
      summary:
        'Built with a close collaborator, Circular-E combined a public recycling experience with account, scheduling, and cashback flows so users could request home pickup of recyclable materials and track their impact.',
      technologies: ['Angular SSR', 'NestJS', 'Prisma', 'Tailwind CSS', 'AWS', 'Redis'],
      highlights: [
        { label: 'Flow', value: 'Pickup scheduling + cashback' },
        { label: 'Surface', value: 'Public site + user dashboard' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets['circular-e'], [
        'Circular-E pickup scheduling flow on mobile',
        'Circular-E recyclable material selection screen',
      ]),
    },
    {
      slug: 'people-search',
      title: 'Person Lookup System',
      role: 'Software Architect & Full Stack Engineer',
      year: '2024',
      category: 'INTERNAL',
      icon: 'pi-lock',
      summary:
        'Internal people search platform backed by SQL Server, a React SPA, and a C# .NET API, delivered with automated Azure deployment and kept intentionally high level because the client work is under NDA.',
      technologies: ['React', 'ShadCN UI', 'C# .NET Core', 'SQL Server', 'Azure Web App', 'Azure Pipelines'],
      highlights: [
        { label: 'Visibility', value: 'Internal-only product' },
        { label: 'Release', value: 'CI / CD on Azure' },
      ],
      screenshots: [],
      privatePreview: true,
    },
  ],
  es: [
    {
      slug: 'guira',
      title: 'Plataforma Fintech de Pagos Internacionales para LATAM',
      role: 'Arquitecto de software e ingeniero full-stack',
      year: '2025',
      category: 'FINTECH',
      icon: 'pi-send',
      summary:
        'MVP de una plataforma fintech para que personas y empresas en Latinoamerica paguen a proveedores internacionales en USD mediante conversion local a USDC y desembolsos con Bridge.',
      technologies: ['React Router v7', 'Supabase', 'Prisma', 'Docker', 'Edge Functions'],
      highlights: [
        { label: 'Enfoque', value: 'Onboarding KYC / KYB' },
        { label: 'Alcance', value: 'Arquitectura MVP + panel de revision' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets.guira, [
        'Pantalla de bienvenida de Guira',
        'Flujo de registro de Guira',
        'Paso de documentos KYC de Guira',
        'Lista de revision KYC de Guira',
      ]),
    },
    {
      slug: 'linne',
      title: 'Linne Plataforma Social de Picks Deportivos',
      role: 'Arquitecto de software e ingeniero full-stack',
      year: '2025',
      category: 'PLATFORM',
      icon: 'pi-video',
      summary:
        'Refactor de un producto social generado automaticamente hacia una plataforma lista para produccion, con flujos de datos controlados, procesamiento asincrono y una experiencia compartida entre web y mobile.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Zustand', 'Capacitor', 'BullMQ'],
      highlights: [
        { label: 'Mejora', value: 'Procesamiento de capturas con IA' },
        { label: 'Alcance', value: 'Historias en web + mobile' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets.linne, [
        'Pantalla principal de Linne',
        'Feed de tickets de Linne',
        'Creacion de historias con video en Linne',
        'Historial de perfil en Linne',
      ]),
    },
    {
      slug: 'mesada',
      title: 'App de Remesas entre Estados Unidos y Mexico',
      role: 'Full Stack Software Engineer',
      year: '2022',
      category: 'FINTECH',
      icon: 'pi-wallet',
      summary:
        'Migracion, mantenimiento y despliegue de una plataforma de remesas que mejoro rendimiento y estabilidad en web y app hibrida, conservando operativos los flujos de KYC y transferencias.',
      technologies: ['React', 'React Native', 'Django REST', 'Celery', 'Postgres', 'EC2'],
      highlights: [
        { label: 'Entrega', value: 'App Store + Play Store' },
        { label: 'Resultado', value: 'Upgrade y estabilizacion' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets.mesada, [
        'Sitio publico de Mesada',
        'Flujo de envio de dinero en Mesada',
        'Historial de transacciones de Mesada',
        'Resumen de transaccion de Mesada',
      ]),
    },
    {
      slug: 'data-go',
      title: 'SaaS Omnicanal para Call Center',
      role: 'Arquitecto de software e ingeniero full-stack',
      year: '2024',
      category: 'PLATFORM',
      icon: 'pi-desktop',
      summary:
        'MVP de una plataforma para call center orientada a agentes y supervisores, incluyendo definicion de arquitectura, seleccion de stack, diseno de interfaz, implementacion inicial y transferencia tecnica.',
      technologies: ['Angular', 'Express', 'Prisma', 'MySQL', 'AWS Cognito', 'Figma'],
      highlights: [
        { label: 'Enfoque', value: 'Operacion de agentes y supervisores' },
        { label: 'Handoff', value: 'Documentacion y capacitacion' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets['data-go'], [
        'Dashboard de Data Go',
        'Dashboard operativo de Data Go',
        'Workspace telefonico de Data Go',
        'Pantalla de acceso de Data Go',
      ]),
    },
    {
      slug: 'circular-e',
      title: 'Circular-E Plataforma de Recoleccion de Reciclaje',
      role: 'Product Engineer y socio tecnico',
      year: '2023',
      category: 'PLATFORM',
      icon: 'pi-refresh',
      summary:
        'Construido junto con un colaborador cercano, Circular-E combinaba una experiencia publica de reciclaje con flujos de cuenta, agenda y cashback para solicitar la recoleccion de materiales reciclables a domicilio y dar seguimiento al impacto del usuario.',
      technologies: ['Angular SSR', 'NestJS', 'Prisma', 'Tailwind CSS', 'AWS', 'Redis'],
      highlights: [
        { label: 'Flujo', value: 'Agenda de recoleccion + cashback' },
        { label: 'Superficie', value: 'Sitio publico + dashboard de usuario' },
      ],
      screenshots: createScreenshots(projectScreenshotAssets['circular-e'], [
        'Flujo mobile de agenda de recoleccion en Circular-E',
        'Pantalla de seleccion de materiales reciclables en Circular-E',
      ]),
    },
    {
      slug: 'people-search',
      title: 'Sistema de Busqueda de Personas',
      role: 'Arquitecto de software e ingeniero full-stack',
      year: '2024',
      category: 'INTERNAL',
      icon: 'pi-lock',
      summary:
        'Plataforma interna de busqueda de personas respaldada por SQL Server, un SPA en React y una API en C# .NET, entregada con despliegue automatizado en Azure y mostrada solo a alto nivel por NDA.',
      technologies: ['React', 'ShadCN UI', 'C# .NET Core', 'SQL Server', 'Azure Web App', 'Azure Pipelines'],
      highlights: [
        { label: 'Visibilidad', value: 'Producto interno' },
        { label: 'Release', value: 'CI / CD en Azure' },
      ],
      screenshots: [],
      privatePreview: true,
    },
  ],
};
