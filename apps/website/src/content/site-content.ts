import type { ImageMetadata } from 'astro';

import { projectScreenshotAssets } from './project-screenshot-assets';
import type { Locale } from '../i18n/translations';

type ResumeExperience = {
  company: string;
  role: string;
  date: string;
  location: string;
  items: string[];
};

type ResumeGroup = {
  label: string;
  items: string[];
};

type JourneyStat = {
  label: string;
  value: string;
};

type JourneyMetric = {
  label: string;
  value: string;
  meta?: string;
  tone?: 'success' | 'default';
};

type JourneyProgress = {
  label: string;
  value: string;
  percentage: number;
};

type JourneyCodeLang = 'py' | 'text' | 'ts';

type JourneyEntry = {
  year: string;
  eyebrow?: string;
  title: string;
  badge?: string;
  description: string;
  metrics?: JourneyMetric[];
  progress?: JourneyProgress[];
  codeTitle?: string;
  code?: string;
  codeLang?: JourneyCodeLang;
  tags?: string[];
};

type ProjectScreenshot = {
  src: ImageMetadata;
  alt: string;
};

const createScreenshots = (assets: ImageMetadata[], alts: string[]): ProjectScreenshot[] =>
  assets.map((src, index) => ({ src, alt: alts[index] ?? '' }));

type Project = {
  slug: string;
  title: string;
  role: string;
  year: string;
  category: 'FINTECH' | 'PLATFORM' | 'INTERNAL';
  icon: string;
  summary: string;
  technologies: string[];
  highlights: Array<{
    label: string;
    value: string;
  }>;
  screenshots: ProjectScreenshot[];
  privatePreview?: boolean;
};

type HomeFeature = {
  title: string;
  subtitle: string;
  badge: string;
  lines: string[];
  tone: 'emerald' | 'blue' | 'neutral';
};

type SiteContent = {
  home: {
    metaDescription: string;
    heroBadge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    journeyTitle: string;
    worksTitle: string;
    worksSubtitle: string;
    worksLinkLabel: string;
    featuresTitle: string;
    featuresSubtitle: string;
    journeyItems: Array<{
      year: string;
      role: string;
      company: string;
      description: string;
    }>;
    features: HomeFeature[];
  };
  projects: {
    pageLabel: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    filters: Array<{
      label: string;
      value: 'ALL' | 'FINTECH' | 'PLATFORM' | 'INTERNAL';
    }>;
    statusLabel: string;
    screenshotLabel: string;
    privatePreviewLabel: string;
    privatePreviewDescription: string;
  };
  resume: {
    metaDescription: string;
    pageLabel: string;
    name: string;
    headline: string;
    summary: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    github: string;
    linkedin: string;
    experienceLabel: string;
    stackLabel: string;
    mentoringLabel: string;
    freelanceLabel: string;
    educationLabel: string;
    languagesLabel: string;
    experience: ResumeExperience[];
    skillGroups: ResumeGroup[];
    mentoring: string[];
    freelance: string[];
    education: {
      title: string;
      school: string;
      date: string;
    };
    languages: string[];
    footerCopyright: string;
    footerNote: string;
  };
  journey: {
    metaDescription: string;
    pageLabel: string;
    pageTitle: string;
    pageDescription: string;
    stats: JourneyStat[];
    entries: JourneyEntry[];
  };
  featuredProjects: Project[];
  projectsList: Project[];
};

const year = new Date().getFullYear();

const currentFocusSnippet = String.raw`const currentPlatform = {
  automation: createPipeline({
    runtime: ['NestJS', 'Puppeteer', 'BullMQ'],
    storage: ['Redis', 'SQLite'],
    maintenance: 'JSON-driven rules',
  }),
  aiSolutions: {
    frontend: ['React', 'React Router v7', 'Zustand', 'React Hook Form', 'Zod'],
    backend: ['FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL'],
    agents: ['CrewAI', 'Python domain services'],
  },
};`;

const architectureSnippet = String.raw`workspace/
  apps/
    shell
    pricing
    analytics
  libs/
    ui
    api-contracts
    validation

// reusable foundations for teams and faster delivery`;

const foundationsSnippet = String.raw`for ticket in incidents:
    diagnose(ticket)
    automate_if_repeatable(ticket)

deploy('python-scripts')
learn('django', 'linux', 'networks')
build('from support into software')`;

const projects: Record<Locale, Project[]> = {
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

const content: Record<Locale, SiteContent> = {
  en: {
    home: {
      metaDescription:
        'Senior full-stack engineer and tech lead building scalable platforms, product foundations, and AI-enabled engineering workflows.',
      heroBadge: 'Available for senior engineering and leadership roles',
      heroTitleLine1: 'Architecting software',
      heroTitleLine2: 'that ships and scales.',
      heroSubtitle:
        'I am Michael Villalba, a senior full-stack engineer and tech lead focused on scalable web platforms, reusable architecture, developer experience, and AI-enabled workflows.',
      heroPrimaryCta: 'View Work',
      heroSecondaryCta: 'Resume',
      journeyTitle: 'Engineering Journey',
      worksTitle: 'Selected Projects',
      worksSubtitle: 'Fintech, internal platforms, and product architecture with real delivery constraints.',
      worksLinkLabel: 'View GitHub',
      featuresTitle: 'What I Bring',
      featuresSubtitle:
        'Architecture, execution, and team enablement shaped by more than a decade of hands-on delivery.',
      journeyItems: [
        {
          year: '2022',
          role: 'Tech Lead / Senior Full-Stack Engineer',
          company: 'AB InBev',
          description:
            'Leading internal platform architecture across scraping systems, design systems, monorepo foundations, and AI-enabled initiatives.',
        },
        {
          year: '2021',
          role: 'Head of Technology',
          company: 'Solidus Capital',
          description:
            'Owned technical direction for fintech and remittance products, balancing architecture, delivery, and team leadership across multiple integrations.',
        },
        {
          year: '2020',
          role: 'Chapter Lead',
          company: 'Kavak',
          description:
            'Helped unblock Angular authentication with AWS Cognito and contributed to Nx monorepo adoption in a high-growth product environment.',
        },
        {
          year: '2018',
          role: 'Tech Lead',
          company: 'Avanttia / CONTPAQi',
          description:
            'Connected business goals with architecture and execution, improving delivery speed through better patterns, clearer structure, and reusable engineering foundations.',
        },
      ],
      features: [
        {
          title: 'Platform Architecture',
          subtitle: 'Monorepos, microfrontends, shared foundations',
          badge: 'Scalable systems',
          lines: ['Nx monorepos', 'Microfrontend patterns', 'Validation and API contracts'],
          tone: 'emerald',
        },
        {
          title: 'Delivery Speed',
          subtitle: 'MVPs without sacrificing maintainability',
          badge: 'Execution focused',
          lines: ['Architecture to MVP in months', 'Reusable templates and utilities', 'Operational systems that last'],
          tone: 'blue',
        },
        {
          title: 'Technical Leadership',
          subtitle: 'Bridge between product, business, and engineering',
          badge: 'Hands-on lead',
          lines: ['Hiring and mentoring', 'Code reviews and standards', 'Clearer decisions for teams'],
          tone: 'neutral',
        },
        {
          title: 'AI-Enabled Workflows',
          subtitle: 'Pragmatic use of agents and LLM tooling',
          badge: 'Current focus',
          lines: ['Developer productivity', 'Agent-based experiments', 'AI-assisted product capabilities'],
          tone: 'blue',
        },
      ],
    },
    projects: {
      pageLabel: `// 2017 - ${year} // PROJECTS`,
      titleLine1: 'Selected',
      titleLine2: 'Project Systems.',
      description:
        'A curated set of platforms, internal tools, and fintech products. Each project keeps the card summary lightweight while exposing visual previews where the work can be shown publicly.',
      filters: [
        { label: 'ALL', value: 'ALL' },
        { label: 'FINTECH', value: 'FINTECH' },
        { label: 'PLATFORM', value: 'PLATFORM' },
        { label: 'INTERNAL', value: 'INTERNAL' },
      ],
      statusLabel: 'Project Snapshot',
      screenshotLabel: 'Preview',
      privatePreviewLabel: 'Private Preview',
      privatePreviewDescription:
        'This client work is under NDA, so the visual surface stays hidden while the architecture and stack remain visible.',
    },
    resume: {
      metaDescription:
        'Resume of Michael Villalba, senior full-stack engineer and tech lead with experience across fintech, SaaS, enterprise systems, and AI-enabled workflows.',
      pageLabel: `// ${year} // RESUME`,
      name: 'Michael Villalba Sotelo',
      headline: 'Senior Full-Stack Engineer | Tech Lead | AI-Enabled Software Architect',
      summary:
        'Full-stack software engineer and technical leader with 11+ years of experience building web platforms, internal systems, automation engines, and developer-focused architectures across fintech, e-commerce, SaaS, enterprise, and AI initiatives.',
      location: 'Mexico City, Mexico',
      email: 'visomi.dev@gmail.com',
      phone: '(+52) 55 8760 6759',
      website: 'visomi.dev',
      github: 'github.com/visomi-dev',
      linkedin: 'linkedin.com/in/visomi',
      experienceLabel: '01 // Experience',
      stackLabel: '02 // Technical Skills',
      mentoringLabel: '03 // Mentoring',
      freelanceLabel: '04 // Selected Freelance',
      educationLabel: '05 // Education',
      languagesLabel: '06 // Languages',
      experience: [
        {
          company: 'AB InBev (Grupo Modelo)',
          role: 'Tech Lead / Senior Full-Stack Engineer',
          date: 'Aug 2022 - Present',
          location: 'Mexico',
          items: [
            'Lead architecture and delivery for internal platforms spanning web scraping, design systems, microfrontend ecosystems, SAP-adjacent integrations, and AI-agent initiatives.',
            'Designed and delivered a configurable scraping engine using NestJS, Puppeteer, BullMQ, Redis, and SQLite to extract competitor pricing data across multiple sites, including complex infinite-scroll experiences.',
            'Took the scraping initiative from architecture through MVP in 3 months and production approval in 6 months, with the solution operating for roughly 2 years on lightweight JSON-based maintenance updates.',
            'Created reusable frontend and backend foundations, including shared templates, validation layers, utilities, and OpenAPI-ready middleware to standardize delivery across teams.',
            'Led the evolution from fragmented applications to Nx monorepo and microfrontend patterns for better scalability, release management, and code reuse.',
          ],
        },
        {
          company: 'Solidus Capital',
          role: 'Head of Technology',
          date: 'Jul 2021 - Jul 2022',
          location: 'Mexico',
          items: [
            'Led engineering for fintech and crypto-related products, including wealth-tracking platforms and remittance products with multiple third-party integrations.',
            'Owned technical direction for a customer-facing asset tracking platform involving KYC / KYB flows, holding structures, and several external service integrations.',
            'Managed developers and external partners while contributing directly to architecture, hiring, code review, and technical problem solving.',
            'Returned as a freelancer to reactivate the Mesada remittance product, upgrading the frontend from React 15 to React 17, fixing backend issues, and preparing the mobile app for App Store and Play Store release.',
          ],
        },
        {
          company: 'Kavak',
          role: 'Chapter Lead',
          date: 'Aug 2020 - Apr 2021',
          location: 'Mexico',
          items: [
            'Led frontend technical initiatives in a hypergrowth environment while contributing as a hands-on engineer.',
            'Implemented AWS Cognito authentication in Angular 12 during an early-stage adoption phase where the integration had previously blocked the team.',
            'Contributed to Nx monorepo adoption and frontend structure improvements within a large-scale product environment.',
          ],
        },
        {
          company: 'Avanttia / CONTPAQi',
          role: 'Tech Lead',
          date: 'Oct 2018 - Aug 2020',
          location: 'Mexico',
          items: [
            'Served as the bridge between business goals, architecture, and day-to-day execution for fiscal and financial software products.',
            'Defined engineering practices, architecture standards, and developer workflows for a team working on collection, accounts payable, and invoicing software.',
            'Architected and delivered an invoicing system in 1 month using Node.js microservices, Vue, PostgreSQL, and MongoDB, helping unlock a new revenue opportunity.',
            'Improved developer experience and delivery speed through clearer architecture, team guidance, and reusable patterns.',
          ],
        },
        {
          company: 'Creze',
          role: 'Tech Lead',
          date: 'Jun 2017 - Oct 2018',
          location: 'Mexico',
          items: [
            'Transitioned from infrastructure and support into professional software development and quickly advanced into technical leadership.',
            'Learned React, JSX, Node.js, and webpack rapidly and delivered the requested website implementation in approximately one week.',
            'Promoted to Tech Lead within 6 months and led a small team of 3 developers while building web applications and internal dashboards for credit tracking and KYC / KYB operations.',
          ],
        },
        {
          company: 'DataVoice and Enlaza Comunicaciones',
          role: 'Technical Support Engineer / Systems Support',
          date: 'Jul 2014 - May 2017',
          location: 'Mexico',
          items: [
            'Built a strong systems foundation across Linux, Windows, networking, telephony, servers, and automation before transitioning full-time into software engineering.',
            'Advanced from intern-level responsibilities to high-trust support work, including software configuration, server administration, troubleshooting, and customer-critical incidents.',
            'Automated operational tasks with Python, Django, scripts, dashboards, and CLI tools while working with telephony and infrastructure systems.',
          ],
        },
      ],
      skillGroups: [
        {
          label: 'Languages',
          items: ['TypeScript', 'JavaScript', 'Python', 'C#', 'Go', 'SQL', 'HTML', 'CSS'],
        },
        {
          label: 'Frontend',
          items: ['React', 'React Router', 'Angular', 'Redux', 'Vue', 'Tailwind CSS', 'ShadCN UI', 'Storybook'],
        },
        {
          label: 'Backend',
          items: [
            'Node.js',
            'Express',
            'NestJS',
            'Koa',
            'Django',
            'Azure Functions',
            'GraphQL',
            'REST APIs',
            'WebSockets',
          ],
        },
        {
          label: 'Architecture',
          items: [
            'Nx monorepos',
            'Microfrontends',
            'Shared libraries',
            'Middleware patterns',
            'Domain services',
            'API contracts',
            'OpenAPI',
          ],
        },
        {
          label: 'Data & Infra',
          items: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Redis', 'SQLite', 'Azure', 'AWS', 'Ubuntu', 'Nginx'],
        },
        {
          label: 'Tooling & AI',
          items: [
            'Zod',
            'ESLint',
            'Prettier',
            'Sonar',
            'Snyk',
            'Husky',
            'BullMQ',
            'Puppeteer',
            'AI agents',
            'CrewAI',
            'OpenAI integrations',
          ],
        },
      ],
      mentoring: [
        'Web Development Mentor at Kodemia from Feb 2019 to Jul 2022, teaching practical web development workflows to developers entering the industry.',
        'Several developers mentored under my guidance later advanced into senior and Tech Lead roles, which remains one of the achievements I value most.',
      ],
      freelance: [
        'Built a waste collection and recycling application using Angular, NestJS, Prisma, and PostgreSQL.',
        'Built Circular-E with a friend: a recycling pickup and cashback platform with Angular SSR, NestJS, Prisma, Redis, and AWS-backed delivery flows.',
        'Developed a full-stack telephony-integrated system with Angular, Express, Prisma, Asterisk Realtime, AMI events, REST APIs, WebSockets, and on-prem Ubuntu / Nginx deployment.',
        'Delivered a people and user administration system using React, C#, Azure Web Apps, and Azure Pipelines.',
        'Refactored a sports betting social platform into an Nx monorepo with React, Express, Supabase, BullMQ, Redis, and Capacitor-based mobile deployment.',
        'Built a remittance application for Bolivia using React, Express, Supabase, BullMQ, and Bridge integrations.',
      ],
      education: {
        title: 'Technical high school studies in computing',
        school: 'Completed through 4th semester',
        date: 'Ongoing self-taught path',
      },
      languages: [
        'Spanish: Native',
        'English: Professional working proficiency (approximately B2 reading and writing)',
      ],
      footerCopyright: `© ${year} MICHAEL VILLALBA. ALL RIGHTS RESERVED.`,
      footerNote: 'DESIGNED FOR ATS PARSING',
    },
    journey: {
      metaDescription:
        "A curated journey through Michael Villalba's growth from systems support into architecture, technical leadership, and AI-enabled engineering.",
      pageLabel: `// 2011 - ${year} // JOURNEY`,
      pageTitle: 'Engineering Journey',
      pageDescription:
        'The story behind the work: curiosity around computers, a foundation in systems and support, fast growth into software engineering, and a current focus on scalable architecture, mentoring, and AI-enabled delivery.',
      stats: [
        { label: 'Years Building', value: '11+' },
        { label: 'Current Level', value: 'Senior / Lead' },
        { label: 'Core Lens', value: 'Architecture + DX' },
        { label: 'Primary OS', value: 'Linux' },
      ],
      entries: [
        {
          year: '2022',
          eyebrow: 'Current chapter',
          title: 'Automation, reuse, and platform thinking at scale',
          badge: 'AB INBEV // ACTIVE',
          description:
            'At AB InBev, the focus became larger systems with longer operating horizons: automation that can run for years, a frontend design system plus reusable engineering foundations for multiple teams, Nx-based monorepo and microfrontend patterns for scale and release management, and now an AI-centered solutions platform that combines React frontends, Python services, and agent-based workflows to improve both product capability and developer productivity.',
          metrics: [
            { label: 'MVP Window', value: '3 months' },
            { label: 'Automation Runtime', value: '2 years', meta: 'lightweight JSON maintenance' },
            { label: 'Current Focus', value: 'AI solutions', meta: 'React + Python + agents' },
          ],
          progress: [
            { label: 'Reusable foundations', value: '82%', percentage: 82 },
            { label: 'AI delivery focus', value: '88%', percentage: 88 },
          ],
          codeTitle: 'platform/current-focus.ts',
          code: currentFocusSnippet,
          codeLang: 'ts',
          tags: [
            'NestJS',
            'Puppeteer',
            'BullMQ',
            'Redis',
            'SQLite',
            'React',
            'React Router v7',
            'Zustand',
            'Zod',
            'React Hook Form',
            'ESLint',
            'PostgreSQL',
            'Python',
            'SQLAlchemy',
            'FastAPI',
            'Alembic',
            'CrewAI',
            'Nx',
          ],
        },
        {
          year: '2017',
          eyebrow: 'Acceleration',
          title: 'From self-taught builder to technical lead',
          description:
            'Creze, Avanttia, Kavak, and Solidus Capital shaped the transition from hands-on developer into architecture and leadership. The common thread was speed with structure: learning unfamiliar stacks quickly, translating business goals into technical execution, and creating clearer systems so teams could move with less friction.',
          progress: [
            { label: 'Delivery speed', value: 'High', percentage: 78 },
            { label: 'DX focus', value: 'Strong', percentage: 86 },
          ],
          codeTitle: 'workspace/blueprint.txt',
          code: architectureSnippet,
          codeLang: 'text',
          tags: ['React', 'Vue', 'Angular', 'Node.js', 'AWS Cognito', 'Microservices'],
        },
        {
          year: '2014',
          eyebrow: 'Foundations',
          title: 'Support, Linux, automation, and the path into software',
          description:
            'The earliest professional stage was not glamorous, but it was formative. Support work built deep systems intuition across Linux, telephony, networking, and troubleshooting. Repetitive operational problems gradually turned into scripts, dashboards, and automation, which made the move into software engineering feel less like a jump and more like a natural extension of solving problems.',
          codeTitle: 'foundations/automation.py',
          code: foundationsSnippet,
          codeLang: 'py',
          tags: ['Linux', 'Asterisk', 'Python', 'Django', 'CLI tools'],
        },
      ],
    },
    featuredProjects: [],
    projectsList: [],
  },
  es: {
    home: {
      metaDescription:
        'Ingeniero full-stack senior y lider tecnico enfocado en plataformas escalables, arquitectura reutilizable y flujos de trabajo potenciados por IA.',
      heroBadge: 'Disponible para roles senior de ingenieria y liderazgo',
      heroTitleLine1: 'Software pensado para',
      heroTitleLine2: 'salir a produccion y escalar.',
      heroSubtitle:
        'Soy Michael Villalba, ingeniero full-stack senior y lider tecnico enfocado en plataformas web escalables, arquitectura reutilizable, experiencia de desarrollo y flujos de trabajo potenciados por IA.',
      heroPrimaryCta: 'Ver proyectos',
      heroSecondaryCta: 'Curriculum',
      journeyTitle: 'Trayectoria',
      worksTitle: 'Proyectos seleccionados',
      worksSubtitle: 'Fintech, plataformas internas y arquitectura de producto con restricciones reales de entrega.',
      worksLinkLabel: 'Ver GitHub',
      featuresTitle: 'Lo que aporto',
      featuresSubtitle:
        'Arquitectura, ejecucion y acompanamiento tecnico construidos a lo largo de mas de una decada entregando software.',
      journeyItems: [
        {
          year: '2022',
          role: 'Lider tecnico / Ingeniero full-stack senior',
          company: 'AB InBev',
          description:
            'Liderando la arquitectura de plataformas internas entre sistemas de scraping, sistemas de diseno, bases de monorepo e iniciativas potenciadas por IA.',
        },
        {
          year: '2021',
          role: 'Director de Tecnologia',
          company: 'Solidus Capital',
          description:
            'Direccion tecnica para productos fintech y de remesas, equilibrando arquitectura, ejecucion y liderazgo de equipo en entornos con multiples integraciones.',
        },
        {
          year: '2020',
          role: 'Lider de capitulo',
          company: 'Kavak',
          description:
            'Ayude a destrabar la autenticacion en Angular con AWS Cognito y contribui a la adopcion de un monorepo con Nx en un entorno de alto crecimiento.',
        },
        {
          year: '2018',
          role: 'Lider tecnico',
          company: 'Avanttia / CONTPAQi',
          description:
            'Conecte objetivos de negocio con arquitectura y ejecucion, mejorando la velocidad de entrega mediante mejores patrones, estructura y bases reutilizables.',
        },
      ],
      features: [
        {
          title: 'Arquitectura de plataforma',
          subtitle: 'Monorepos, microfrontends y bases compartidas',
          badge: 'Sistemas escalables',
          lines: ['Monorepos con Nx', 'Patrones de microfrontend', 'Validacion y contratos de API'],
          tone: 'emerald',
        },
        {
          title: 'Velocidad de entrega',
          subtitle: 'MVPs sin sacrificar mantenibilidad',
          badge: 'Enfoque en ejecucion',
          lines: [
            'De arquitectura a MVP en meses',
            'Plantillas y utilidades reutilizables',
            'Sistemas que siguen funcionando con el tiempo',
          ],
          tone: 'blue',
        },
        {
          title: 'Liderazgo tecnico',
          subtitle: 'Puente entre producto, negocio e ingenieria',
          badge: 'Liderazgo cercano',
          lines: [
            'Contratacion y mentoria',
            'Revisiones de codigo y estandares',
            'Decisiones mas claras para los equipos',
          ],
          tone: 'neutral',
        },
        {
          title: 'Flujos de trabajo con IA',
          subtitle: 'Uso pragmatico de agentes y herramientas con LLMs',
          badge: 'Enfoque actual',
          lines: [
            'Productividad de desarrolladores',
            'Experimentos con agentes',
            'Capacidades de producto asistidas por IA',
          ],
          tone: 'blue',
        },
      ],
    },
    projects: {
      pageLabel: `// 2017 - ${year} // PROYECTOS`,
      titleLine1: 'Sistemas y',
      titleLine2: 'proyectos seleccionados.',
      description:
        'Una seleccion curada de plataformas, herramientas internas y productos fintech. Cada proyecto mantiene una presentacion concisa, pero muestra vistas previas cuando el trabajo puede compartirse publicamente.',
      filters: [
        { label: 'TODOS', value: 'ALL' },
        { label: 'FINTECH', value: 'FINTECH' },
        { label: 'PLATAFORMA', value: 'PLATFORM' },
        { label: 'INTERNO', value: 'INTERNAL' },
      ],
      statusLabel: 'Resumen del proyecto',
      screenshotLabel: 'Vista previa',
      privatePreviewLabel: 'Vista previa privada',
      privatePreviewDescription:
        'Este trabajo esta cubierto por NDA, por eso la capa visual se mantiene oculta aunque la arquitectura y la pila tecnologica sigan siendo visibles.',
    },
    resume: {
      metaDescription:
        'Curriculum de Michael Villalba, ingeniero full-stack senior y lider tecnico con experiencia en fintech, SaaS, sistemas empresariales y flujos de trabajo potenciados por IA.',
      pageLabel: `// ${year} // CURRICULUM`,
      name: 'Michael Villalba Sotelo',
      headline: 'Ingeniero Full-Stack Senior | Lider tecnico | Arquitecto de software con IA aplicada',
      summary:
        'Ingeniero full-stack y lider tecnico con mas de 11 anos de experiencia construyendo plataformas web, sistemas internos, motores de automatizacion y arquitecturas orientadas a la experiencia de desarrollo en fintech, e-commerce, SaaS, entornos empresariales e iniciativas de IA.',
      location: 'Ciudad de Mexico, Mexico',
      email: 'visomi.dev@gmail.com',
      phone: '(+52) 55 8760 6759',
      website: 'visomi.dev',
      github: 'github.com/visomi-dev',
      linkedin: 'linkedin.com/in/visomi',
      experienceLabel: '01 // Experiencia',
      stackLabel: '02 // Capacidades tecnicas',
      mentoringLabel: '03 // Mentoria',
      freelanceLabel: '04 // Freelance seleccionado',
      educationLabel: '05 // Educacion',
      languagesLabel: '06 // Idiomas',
      experience: [
        {
          company: 'AB InBev (Grupo Modelo)',
          role: 'Lider tecnico / Ingeniero full-stack senior',
          date: 'Ago 2022 - Presente',
          location: 'Mexico',
          items: [
            'Lidero la arquitectura y entrega de plataformas internas entre scraping, sistemas de diseno, ecosistemas de microfrontends, integraciones cercanas a SAP e iniciativas con agentes de IA.',
            'Disene y entregue un motor de scraping configurable con NestJS, Puppeteer, BullMQ, Redis y SQLite para extraer precios de competidores en multiples sitios, incluyendo experiencias con desplazamiento infinito.',
            'Lleve la iniciativa desde la arquitectura hasta un MVP en 3 meses y a aprobacion de produccion en 6 meses, operando despues por alrededor de 2 anos con mantenimiento ligero basado en reglas JSON.',
            'Cree bases reutilizables de frontend y backend, incluyendo plantillas compartidas, capas de validacion, utilidades y middleware preparado para OpenAPI para estandarizar la entrega entre equipos.',
            'Impulse la evolucion desde aplicaciones fragmentadas hacia un monorepo con Nx y patrones de microfrontend para mejorar escalabilidad, despliegues y reutilizacion.',
          ],
        },
        {
          company: 'Solidus Capital',
          role: 'Director de Tecnologia',
          date: 'Jul 2021 - Jul 2022',
          location: 'Mexico',
          items: [
            'Lidere ingenieria para productos fintech y vinculados con cripto, incluyendo plataformas de seguimiento patrimonial y productos de remesas con multiples integraciones.',
            'Defini la direccion tecnica de una plataforma orientada al cliente con flujos KYC / KYB, estructuras de holdings e integraciones con servicios externos.',
            'Coordine desarrolladores y socios externos mientras participaba directamente en arquitectura, contratacion, revisiones de codigo y resolucion tecnica.',
            'Regrese como freelancer para reactivar el producto Mesada, actualizando el frontend de React 15 a React 17, corrigiendo problemas de backend y preparando la app para App Store y Play Store.',
          ],
        },
        {
          company: 'Kavak',
          role: 'Lider de capitulo',
          date: 'Ago 2020 - Abr 2021',
          location: 'Mexico',
          items: [
            'Lidere iniciativas tecnicas de frontend en un entorno de crecimiento acelerado mientras seguia contribuyendo de forma directa.',
            'Implemente autenticacion con AWS Cognito en Angular 12 en una fase temprana en la que esa integracion habia bloqueado al equipo.',
            'Contribui a la adopcion de un monorepo con Nx y a mejoras estructurales de frontend en un producto de gran escala.',
          ],
        },
        {
          company: 'Avanttia / CONTPAQi',
          role: 'Lider tecnico',
          date: 'Oct 2018 - Ago 2020',
          location: 'Mexico',
          items: [
            'Fui el puente entre objetivos de negocio, arquitectura y ejecucion diaria para productos fiscales y financieros.',
            'Defini practicas de ingenieria, estandares de arquitectura y flujos de desarrollo para un equipo que trabajaba en cobranza, cuentas por pagar y facturacion.',
            'Arquitecte y entregue un sistema de facturacion en 1 mes usando microservicios con Node.js, Vue, PostgreSQL y MongoDB, ayudando a abrir una nueva oportunidad de ingresos.',
            'Mejore la experiencia de desarrollo y la velocidad de entrega mediante una arquitectura mas clara, guia tecnica y patrones reutilizables.',
          ],
        },
        {
          company: 'Creze',
          role: 'Lider tecnico',
          date: 'Jun 2017 - Oct 2018',
          location: 'Mexico',
          items: [
            'Transicione de infraestructura y soporte hacia el desarrollo profesional de software y avance rapidamente hacia liderazgo tecnico.',
            'Aprendi React, JSX, Node.js y webpack con rapidez, y entregue el sitio solicitado en aproximadamente una semana.',
            'Fui promovido a lider tecnico en 6 meses y lidere un equipo pequeno de 3 desarrolladores construyendo aplicaciones web y tableros internos para seguimiento de credito y operaciones KYC / KYB.',
          ],
        },
        {
          company: 'DataVoice y Enlaza Comunicaciones',
          role: 'Ingeniero de soporte tecnico / Soporte de sistemas',
          date: 'Jul 2014 - May 2017',
          location: 'Mexico',
          items: [
            'Construyi una base solida en Linux, Windows, redes, telefonia, servidores y automatizacion antes de moverme por completo hacia la ingenieria de software.',
            'Avance desde responsabilidades de becario hasta trabajo de soporte de alta confianza, incluyendo configuracion de software, administracion de servidores, diagnostico de fallas y manejo de incidentes criticos.',
            'Automatice tareas operativas con Python, Django, scripts, dashboards y herramientas CLI mientras trabajaba con telefonia e infraestructura.',
          ],
        },
      ],
      skillGroups: [
        {
          label: 'Lenguajes',
          items: ['TypeScript', 'JavaScript', 'Python', 'C#', 'Go', 'SQL', 'HTML', 'CSS'],
        },
        {
          label: 'Frontend',
          items: ['React', 'React Router', 'Angular', 'Redux', 'Vue', 'Tailwind CSS', 'ShadCN UI', 'Storybook'],
        },
        {
          label: 'Backend',
          items: [
            'Node.js',
            'Express',
            'NestJS',
            'Koa',
            'Django',
            'Azure Functions',
            'GraphQL',
            'REST APIs',
            'WebSockets',
          ],
        },
        {
          label: 'Arquitectura',
          items: [
            'Monorepos con Nx',
            'Microfrontends',
            'Bibliotecas compartidas',
            'Patrones de middleware',
            'Servicios de dominio',
            'Contratos de API',
            'OpenAPI',
          ],
        },
        {
          label: 'Datos e infraestructura',
          items: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Redis', 'SQLite', 'Azure', 'AWS', 'Ubuntu', 'Nginx'],
        },
        {
          label: 'Herramientas e IA',
          items: [
            'Zod',
            'ESLint',
            'Prettier',
            'Sonar',
            'Snyk',
            'Husky',
            'BullMQ',
            'Puppeteer',
            'Agentes de IA',
            'CrewAI',
            'Integraciones OpenAI',
          ],
        },
      ],
      mentoring: [
        'Mentor de desarrollo web en Kodemia entre feb 2019 y jul 2022, ensenando flujos de trabajo practicos a personas que querian entrar a la industria.',
        'Varios desarrolladores a quienes acompane avanzaron despues hacia roles senior y de liderazgo tecnico, algo que sigo considerando uno de mis logros mas valiosos.',
      ],
      freelance: [
        'Construccion de una aplicacion de recoleccion y reciclaje con Angular, NestJS, Prisma y PostgreSQL.',
        'Construccion de Circular-E con un socio cercano: una plataforma de recoleccion de reciclaje y cashback con Angular SSR, NestJS, Prisma, Redis y despliegue sobre AWS.',
        'Desarrollo de un sistema full-stack integrado con telefonia usando Angular, Express, Prisma, Asterisk Realtime, eventos AMI, APIs REST, WebSockets y despliegue local en Ubuntu / Nginx.',
        'Entrega de un sistema de administracion de personas y usuarios con React, C#, Azure Web Apps y Azure Pipelines.',
        'Refactor de una plataforma social de apuestas hacia un monorepo con Nx, React, Express, Supabase, BullMQ, Redis y despliegue movil con Capacitor.',
        'Construccion de una aplicacion de remesas para Bolivia usando React, Express, Supabase, BullMQ e integraciones con Bridge.',
      ],
      education: {
        title: 'Estudios tecnicos de preparatoria en computacion',
        school: 'Completados hasta cuarto semestre',
        date: 'Ruta autodidacta continua',
      },
      languages: ['Espanol: Nativo', 'Ingles: Dominio profesional de trabajo (aprox. B2 en lectura y escritura)'],
      footerCopyright: `© ${year} MICHAEL VILLALBA. TODOS LOS DERECHOS RESERVADOS.`,
      footerNote: 'DISENADO PARA ATS',
    },
    journey: {
      metaDescription:
        'Una trayectoria curada sobre el crecimiento de Michael Villalba desde soporte y sistemas hacia arquitectura, liderazgo tecnico y entrega potenciada por IA.',
      pageLabel: `// 2011 - ${year} // TRAYECTORIA`,
      pageTitle: 'Trayectoria de Ingenieria',
      pageDescription:
        'La historia detras del trabajo: curiosidad por las computadoras, base en sistemas y soporte, crecimiento rapido hacia la ingenieria de software y un enfoque actual en arquitectura escalable, mentoria y entrega potenciada por IA.',
      stats: [
        { label: 'Anos construyendo', value: '11+' },
        { label: 'Nivel actual', value: 'Senior / Lead' },
        { label: 'Enfoque central', value: 'Arquitectura + DX' },
        { label: 'SO principal', value: 'Linux' },
      ],
      entries: [
        {
          year: '2022',
          eyebrow: 'Etapa actual',
          title: 'Automatizacion, reutilizacion y pensamiento de plataforma a escala',
          badge: 'AB INBEV // ACTIVO',
          description:
            'En AB InBev el enfoque se volvio mas amplio y mas duradero: automatizaciones que pueden operar por anos, un sistema de diseno de frontend con bases reutilizables para multiples equipos, patrones de monorepo con Nx y microfrontends para escalar y gestionar despliegues, y ahora una plataforma de soluciones centrada en IA que combina frontends en React, servicios en Python y flujos con agentes para mejorar tanto el producto como la productividad del equipo.',
          metrics: [
            { label: 'Ventana MVP', value: '3 meses' },
            { label: 'Operacion automatizada', value: '2 anos', meta: 'mantenimiento ligero con JSON' },
            { label: 'Enfoque actual', value: 'Soluciones con IA', meta: 'React + Python + agentes' },
          ],
          progress: [
            { label: 'Bases reutilizables', value: '82%', percentage: 82 },
            { label: 'Foco de entrega con IA', value: '88%', percentage: 88 },
          ],
          codeTitle: 'platform/current-focus.ts',
          code: currentFocusSnippet,
          codeLang: 'ts',
          tags: [
            'NestJS',
            'Puppeteer',
            'BullMQ',
            'Redis',
            'SQLite',
            'React',
            'React Router v7',
            'Zustand',
            'Zod',
            'React Hook Form',
            'ESLint',
            'PostgreSQL',
            'Python',
            'SQLAlchemy',
            'FastAPI',
            'Alembic',
            'CrewAI',
            'Nx',
          ],
        },
        {
          year: '2017',
          eyebrow: 'Aceleracion',
          title: 'De autodidacta a lider tecnico',
          description:
            'Creze, Avanttia, Kavak y Solidus Capital marcaron la transicion de un perfil tecnico muy involucrado en la ejecucion hacia arquitectura y liderazgo. El hilo conductor fue la velocidad con estructura: aprender stacks nuevos rapidamente, traducir objetivos de negocio a ejecucion tecnica y crear sistemas mas claros para que los equipos avanzaran con menos friccion.',
          progress: [
            { label: 'Velocidad de entrega', value: 'Alta', percentage: 78 },
            { label: 'Enfoque en DX', value: 'Fuerte', percentage: 86 },
          ],
          codeTitle: 'workspace/blueprint.txt',
          code: architectureSnippet,
          codeLang: 'text',
          tags: ['React', 'Vue', 'Angular', 'Node.js', 'AWS Cognito', 'Microservicios'],
        },
        {
          year: '2014',
          eyebrow: 'Fundamentos',
          title: 'Soporte, Linux, automatizacion y el paso hacia el software',
          description:
            'La etapa inicial no fue glamorosa, pero si formativa. El trabajo de soporte construyo una intuicion profunda sobre Linux, telefonia, redes y resolucion de fallas. Los problemas operativos repetitivos se fueron transformando en scripts, dashboards y automatizaciones, haciendo que el salto a la ingenieria de software se sintiera menos como un cambio brusco y mas como una extension natural de resolver problemas.',
          codeTitle: 'foundations/automation.py',
          code: foundationsSnippet,
          codeLang: 'py',
          tags: ['Linux', 'Asterisk', 'Python', 'Django', 'Herramientas CLI'],
        },
      ],
    },
    featuredProjects: [],
    projectsList: [],
  },
};

content.en.projectsList = projects.en;
content.en.featuredProjects = [projects.en[0], projects.en[1], projects.en[3]];
content.es.projectsList = projects.es;
content.es.featuredProjects = [projects.es[0], projects.es[1], projects.es[3]];

export const getSiteContent = (locale: Locale) => content[locale];
