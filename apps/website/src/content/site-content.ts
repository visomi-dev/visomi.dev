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
  src: string;
  alt: string;
};

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
      screenshots: [
        { src: '/projects/guira/welcome.png', alt: 'Guira welcome screen' },
        { src: '/projects/guira/sign-up.png', alt: 'Guira sign up flow' },
        { src: '/projects/guira/kyc-documents.png', alt: 'Guira KYC document step' },
        { src: '/projects/guira/admin-kyc-list.png', alt: 'Guira admin KYC review list' },
      ],
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
      screenshots: [
        { src: '/projects/linne/home.png', alt: 'Linne home screen' },
        { src: '/projects/linne/new-ticket-feed.png', alt: 'Linne ticket feed' },
        { src: '/projects/linne/new-ticket-story-video.png', alt: 'Linne story creation with video' },
        { src: '/projects/linne/profile-history.png', alt: 'Linne profile history view' },
      ],
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
      screenshots: [
        { src: '/projects/mesada/website.png', alt: 'Mesada marketing website' },
        { src: '/projects/mesada/send.png', alt: 'Mesada send money flow' },
        { src: '/projects/mesada/history.png', alt: 'Mesada transaction history' },
        { src: '/projects/mesada/transaction_summary.png', alt: 'Mesada transaction summary' },
      ],
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
      screenshots: [
        { src: '/projects/data-go/dashboard.png', alt: 'Data Go dashboard view' },
        { src: '/projects/data-go/dashboard_2.png', alt: 'Data Go operational dashboard' },
        { src: '/projects/data-go/phone.png', alt: 'Data Go phone workspace' },
        { src: '/projects/data-go/login.png', alt: 'Data Go login screen' },
      ],
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
      role: 'Arquitecto de Software y Full Stack Engineer',
      year: '2025',
      category: 'FINTECH',
      icon: 'pi-send',
      summary:
        'MVP de una plataforma fintech para que personas y empresas en Latinoamerica paguen proveedores internacionales en USD mediante conversion local a USDC y payouts con Bridge.',
      technologies: ['React Router v7', 'Supabase', 'Prisma', 'Docker', 'Edge Functions'],
      highlights: [
        { label: 'Enfoque', value: 'Onboarding KYC / KYB' },
        { label: 'Alcance', value: 'Arquitectura MVP + revision admin' },
      ],
      screenshots: [
        { src: '/projects/guira/welcome.png', alt: 'Pantalla de bienvenida de Guira' },
        { src: '/projects/guira/sign-up.png', alt: 'Flujo de registro de Guira' },
        { src: '/projects/guira/kyc-documents.png', alt: 'Paso de documentos KYC de Guira' },
        { src: '/projects/guira/admin-kyc-list.png', alt: 'Lista de revision KYC de Guira' },
      ],
    },
    {
      slug: 'linne',
      title: 'Linne Plataforma Social de Picks Deportivos',
      role: 'Arquitecto de Software y Full Stack Engineer',
      year: '2025',
      category: 'PLATFORM',
      icon: 'pi-video',
      summary:
        'Refactor de un producto social generado automaticamente hacia una plataforma lista para produccion, con flujos de datos controlados, procesamiento asincrono y experiencia compartida entre web y mobile.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Zustand', 'Capacitor', 'BullMQ'],
      highlights: [
        { label: 'Mejora', value: 'Procesamiento AI de screenshots' },
        { label: 'Alcance', value: 'Historias en web + mobile' },
      ],
      screenshots: [
        { src: '/projects/linne/home.png', alt: 'Pantalla principal de Linne' },
        { src: '/projects/linne/new-ticket-feed.png', alt: 'Feed de tickets de Linne' },
        { src: '/projects/linne/new-ticket-story-video.png', alt: 'Creacion de historias con video en Linne' },
        { src: '/projects/linne/profile-history.png', alt: 'Historial de perfil en Linne' },
      ],
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
      screenshots: [
        { src: '/projects/mesada/website.png', alt: 'Sitio publico de Mesada' },
        { src: '/projects/mesada/send.png', alt: 'Flujo de envio de dinero en Mesada' },
        { src: '/projects/mesada/history.png', alt: 'Historial de transacciones de Mesada' },
        { src: '/projects/mesada/transaction_summary.png', alt: 'Resumen de transaccion de Mesada' },
      ],
    },
    {
      slug: 'data-go',
      title: 'SaaS Omnicanal para Call Center',
      role: 'Arquitecto de Software y Full Stack Engineer',
      year: '2024',
      category: 'PLATFORM',
      icon: 'pi-desktop',
      summary:
        'MVP de una plataforma para call center orientada a agentes y supervisores, incluyendo definicion de arquitectura, seleccion de stack, diseno UI, implementacion inicial y handoff tecnico.',
      technologies: ['Angular', 'Express', 'Prisma', 'MySQL', 'AWS Cognito', 'Figma'],
      highlights: [
        { label: 'Enfoque', value: 'Operacion de agentes y supervisores' },
        { label: 'Handoff', value: 'Documentacion y capacitacion' },
      ],
      screenshots: [
        { src: '/projects/data-go/dashboard.png', alt: 'Dashboard de Data Go' },
        { src: '/projects/data-go/dashboard_2.png', alt: 'Dashboard operativo de Data Go' },
        { src: '/projects/data-go/phone.png', alt: 'Workspace telefonico de Data Go' },
        { src: '/projects/data-go/login.png', alt: 'Pantalla de acceso de Data Go' },
      ],
    },
    {
      slug: 'people-search',
      title: 'Sistema de Busqueda de Personas',
      role: 'Arquitecto de Software y Full Stack Engineer',
      year: '2024',
      category: 'INTERNAL',
      icon: 'pi-lock',
      summary:
        'Plataforma interna de busqueda de personas soportada por SQL Server, un SPA en React y una API en C# .NET, entregada con despliegue automatizado en Azure y presentada a alto nivel por NDA.',
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
        'Senior full-stack engineer y tech lead enfocado en plataformas escalables, arquitectura reusable y flujos de trabajo potenciados con IA.',
      heroBadge: 'Disponible para roles senior de ingenieria y liderazgo',
      heroTitleLine1: 'Arquitectando software',
      heroTitleLine2: 'que se entrega y escala.',
      heroSubtitle:
        'Soy Michael Villalba, senior full-stack engineer y tech lead enfocado en plataformas web escalables, arquitectura reusable, developer experience y flujos de trabajo potenciados con IA.',
      heroPrimaryCta: 'Ver proyectos',
      heroSecondaryCta: 'Curriculum',
      journeyTitle: 'Trayectoria',
      worksTitle: 'Proyectos Seleccionados',
      worksSubtitle: 'Fintech, plataformas internas y arquitectura de producto con restricciones reales de entrega.',
      worksLinkLabel: 'Ver GitHub',
      featuresTitle: 'Lo Que Aporto',
      featuresSubtitle: 'Arquitectura, ejecucion y habilitacion de equipos a partir de mas de una decada construyendo.',
      journeyItems: [
        {
          year: '2022',
          role: 'Tech Lead / Senior Full-Stack Engineer',
          company: 'AB InBev',
          description:
            'Liderando arquitectura de plataformas internas entre sistemas de scraping, design systems, foundations de monorepo e iniciativas potenciadas con IA.',
        },
        {
          year: '2021',
          role: 'Head of Technology',
          company: 'Solidus Capital',
          description:
            'Direccion tecnica para productos fintech y de remesas, equilibrando arquitectura, entrega y liderazgo de equipo con multiples integraciones.',
        },
        {
          year: '2020',
          role: 'Chapter Lead',
          company: 'Kavak',
          description:
            'Ayude a destrabar autenticacion Angular con AWS Cognito y contribui a la adopcion de Nx monorepo en un entorno de alto crecimiento.',
        },
        {
          year: '2018',
          role: 'Tech Lead',
          company: 'Avanttia / CONTPAQi',
          description:
            'Conecte objetivos de negocio con arquitectura y ejecucion, mejorando velocidad de entrega mediante mejores patrones, estructura y reusable foundations.',
        },
      ],
      features: [
        {
          title: 'Arquitectura de Plataforma',
          subtitle: 'Monorepos, microfrontends y foundations compartidas',
          badge: 'Sistemas escalables',
          lines: ['Nx monorepos', 'Patrones de microfrontend', 'Validacion y contratos de API'],
          tone: 'emerald',
        },
        {
          title: 'Velocidad de Entrega',
          subtitle: 'MVPs sin sacrificar mantenibilidad',
          badge: 'Enfoque en ejecucion',
          lines: [
            'Arquitectura a MVP en meses',
            'Templates y utilidades reusables',
            'Sistemas operando por largo tiempo',
          ],
          tone: 'blue',
        },
        {
          title: 'Liderazgo Tecnico',
          subtitle: 'Puente entre producto, negocio e ingenieria',
          badge: 'Lead hands-on',
          lines: ['Hiring y mentoring', 'Code reviews y estandares', 'Decisiones mas claras para equipos'],
          tone: 'neutral',
        },
        {
          title: 'Workflows con IA',
          subtitle: 'Uso pragmatico de agentes y tooling con LLMs',
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
      titleLine1: 'Sistemas de',
      titleLine2: 'Proyecto Seleccionados.',
      description:
        'Una seleccion curada de plataformas, herramientas internas y productos fintech. Cada proyecto mantiene la tarjeta ligera mientras expone previews visuales cuando el trabajo puede mostrarse publicamente.',
      filters: [
        { label: 'TODOS', value: 'ALL' },
        { label: 'FINTECH', value: 'FINTECH' },
        { label: 'PLATAFORMA', value: 'PLATFORM' },
        { label: 'INTERNO', value: 'INTERNAL' },
      ],
      statusLabel: 'Snapshot del Proyecto',
      screenshotLabel: 'Preview',
      privatePreviewLabel: 'Preview Privado',
      privatePreviewDescription:
        'Este trabajo esta cubierto por NDA, por eso la superficie visual permanece oculta aunque la arquitectura y el stack sigan visibles.',
    },
    resume: {
      metaDescription:
        'Curriculum de Michael Villalba, senior full-stack engineer y tech lead con experiencia en fintech, SaaS, sistemas empresariales y workflows potenciados con IA.',
      pageLabel: `// ${year} // CURRICULUM`,
      name: 'Michael Villalba Sotelo',
      headline: 'Senior Full-Stack Engineer | Tech Lead | AI-Enabled Software Architect',
      summary:
        'Ingeniero full-stack y lider tecnico con 11+ anos de experiencia construyendo plataformas web, sistemas internos, motores de automatizacion y arquitecturas orientadas a developer experience en fintech, e-commerce, SaaS, enterprise e iniciativas de IA.',
      location: 'Ciudad de Mexico, Mexico',
      email: 'visomi.dev@gmail.com',
      phone: '(+52) 55 8760 6759',
      website: 'visomi.dev',
      github: 'github.com/visomi-dev',
      linkedin: 'linkedin.com/in/visomi',
      experienceLabel: '01 // Experiencia',
      stackLabel: '02 // Skills Tecnicos',
      mentoringLabel: '03 // Mentoria',
      freelanceLabel: '04 // Freelance Seleccionado',
      educationLabel: '05 // Educacion',
      languagesLabel: '06 // Idiomas',
      experience: [
        {
          company: 'AB InBev (Grupo Modelo)',
          role: 'Tech Lead / Senior Full-Stack Engineer',
          date: 'Ago 2022 - Presente',
          location: 'Mexico',
          items: [
            'Lidero arquitectura y entrega de plataformas internas entre scraping, design systems, ecosistemas de microfrontends, integraciones cercanas a SAP e iniciativas con agentes de IA.',
            'Disene y entregue un scraping engine configurable con NestJS, Puppeteer, BullMQ, Redis y SQLite para extraer precios de competidores en multiples sitios, incluyendo experiencias con infinite scroll.',
            'Lleve la iniciativa desde arquitectura hasta MVP en 3 meses y aprobacion de produccion en 6 meses, operando despues por alrededor de 2 anos con mantenimiento ligero basado en reglas JSON.',
            'Cree foundations reutilizables de frontend y backend, incluyendo templates compartidos, capas de validacion, utilidades y middleware preparado para OpenAPI para estandarizar la entrega entre equipos.',
            'Impulse la evolucion desde aplicaciones fragmentadas hacia patrones con Nx monorepo y microfrontends para mejor escalabilidad, releases y reutilizacion.',
          ],
        },
        {
          company: 'Solidus Capital',
          role: 'Head of Technology',
          date: 'Jul 2021 - Jul 2022',
          location: 'Mexico',
          items: [
            'Lidere ingenieria para productos fintech y relacionados con crypto, incluyendo plataformas de wealth tracking y productos de remesas con multiples integraciones.',
            'Defini la direccion tecnica de una plataforma orientada al cliente con flujos KYC / KYB, estructuras de holdings e integraciones con servicios externos.',
            'Coordine developers y partners externos mientras participaba directamente en arquitectura, hiring, code review y resolucion tecnica.',
            'Regrese como freelancer para reactivar el producto Mesada, actualizando el frontend de React 15 a React 17, corrigiendo problemas backend y preparando la app para App Store y Play Store.',
          ],
        },
        {
          company: 'Kavak',
          role: 'Chapter Lead',
          date: 'Ago 2020 - Abr 2021',
          location: 'Mexico',
          items: [
            'Lidere iniciativas tecnicas frontend en un entorno de hypergrowth mientras seguia contribuyendo de forma hands-on.',
            'Implemente autenticacion con AWS Cognito en Angular 12 en una fase temprana donde esa integracion habia bloqueado al equipo.',
            'Contribui a la adopcion de Nx monorepo y a mejoras estructurales frontend en un producto de gran escala.',
          ],
        },
        {
          company: 'Avanttia / CONTPAQi',
          role: 'Tech Lead',
          date: 'Oct 2018 - Ago 2020',
          location: 'Mexico',
          items: [
            'Fui el puente entre objetivos de negocio, arquitectura y ejecucion diaria para productos fiscales y financieros.',
            'Defini practicas de ingenieria, estandares de arquitectura y workflows de desarrollo para un equipo que trabajaba en cobranza, cuentas por pagar y facturacion.',
            'Arquitete y entregue un sistema de facturacion en 1 mes usando microservicios Node.js, Vue, PostgreSQL y MongoDB, ayudando a abrir una nueva oportunidad de ingresos.',
            'Mejore developer experience y velocidad de entrega mediante arquitectura mas clara, guia tecnica y patrones reutilizables.',
          ],
        },
        {
          company: 'Creze',
          role: 'Tech Lead',
          date: 'Jun 2017 - Oct 2018',
          location: 'Mexico',
          items: [
            'Transicione de infraestructura y soporte hacia desarrollo profesional de software y avance rapidamente hacia liderazgo tecnico.',
            'Aprendi React, JSX, Node.js y webpack con rapidez y entregue el sitio solicitado en aproximadamente una semana.',
            'Fui promovido a Tech Lead en 6 meses y lidere un equipo pequeno de 3 developers construyendo aplicaciones web y dashboards internos para seguimiento de credito y operaciones KYC / KYB.',
          ],
        },
        {
          company: 'DataVoice y Enlaza Comunicaciones',
          role: 'Technical Support Engineer / Systems Support',
          date: 'Jul 2014 - May 2017',
          location: 'Mexico',
          items: [
            'Construyi una base solida en Linux, Windows, networking, telefonia, servidores y automatizacion antes de moverme por completo a software engineering.',
            'Avance desde responsabilidades de becario hasta trabajo de soporte de alta confianza, incluyendo configuracion de software, administracion de servidores, troubleshooting e incidentes criticos.',
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
            'Nx monorepos',
            'Microfrontends',
            'Librerias compartidas',
            'Middleware patterns',
            'Domain services',
            'API contracts',
            'OpenAPI',
          ],
        },
        {
          label: 'Data e Infra',
          items: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Redis', 'SQLite', 'Azure', 'AWS', 'Ubuntu', 'Nginx'],
        },
        {
          label: 'Tooling e IA',
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
            'Integraciones OpenAI',
          ],
        },
      ],
      mentoring: [
        'Mentor de desarrollo web en Kodemia entre feb 2019 y jul 2022, ensenando workflows practicos de desarrollo a personas que querian entrar a la industria.',
        'Varios developers mentoreados bajo mi guia avanzaron despues hacia roles senior y de Tech Lead, algo que sigo considerando de mis logros mas valiosos.',
      ],
      freelance: [
        'Construccion de una aplicacion de recoleccion y reciclaje con Angular, NestJS, Prisma y PostgreSQL.',
        'Desarrollo de un sistema full-stack integrado con telefonia usando Angular, Express, Prisma, Asterisk Realtime, eventos AMI, REST APIs, WebSockets y despliegue on-premise en Ubuntu / Nginx.',
        'Entrega de un sistema de administracion de personas y usuarios con React, C#, Azure Web Apps y Azure Pipelines.',
        'Refactor de una plataforma social de apuestas hacia un Nx monorepo con React, Express, Supabase, BullMQ, Redis y despliegue mobile con Capacitor.',
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
        'Una trayectoria curada sobre el crecimiento de Michael Villalba desde soporte y sistemas hacia arquitectura, liderazgo tecnico y delivery potenciado con IA.',
      pageLabel: `// 2011 - ${year} // TRAYECTORIA`,
      pageTitle: 'Trayectoria de Ingenieria',
      pageDescription:
        'La historia detras del trabajo: curiosidad por las computadoras, base en sistemas y soporte, crecimiento rapido hacia software engineering y un enfoque actual en arquitectura escalable, mentoring y delivery potenciado con IA.',
      stats: [
        { label: 'Anos Construyendo', value: '11+' },
        { label: 'Nivel Actual', value: 'Senior / Lead' },
        { label: 'Lente Central', value: 'Arquitectura + DX' },
        { label: 'SO Principal', value: 'Linux' },
      ],
      entries: [
        {
          year: '2022',
          eyebrow: 'Etapa actual',
          title: 'Automatizacion, reutilizacion y pensamiento de plataforma a escala',
          badge: 'AB INBEV // ACTIVO',
          description:
            'En AB InBev el enfoque se volvio mas grande y mas duradero: automatizaciones que pueden operar por anos, un design system frontend mas foundations reutilizables para multiples equipos, patrones con Nx monorepo y microfrontends para escalar y gestionar releases, y ahora una plataforma de soluciones centrada en IA que combina frontends en React, servicios en Python y flujos con agentes para mejorar tanto el producto como la productividad del equipo.',
          metrics: [
            { label: 'Ventana MVP', value: '3 meses' },
            { label: 'Operacion automatizada', value: '2 anos', meta: 'mantenimiento ligero con JSON' },
            { label: 'Enfoque actual', value: 'Soluciones IA', meta: 'React + Python + agentes' },
          ],
          progress: [
            { label: 'Foundations reutilizables', value: '82%', percentage: 82 },
            { label: 'Foco de entrega IA', value: '88%', percentage: 88 },
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
            'Creze, Avanttia, Kavak y Solidus Capital marcaron la transicion de developer hands-on hacia arquitectura y liderazgo. El hilo comun fue velocidad con estructura: aprender stacks nuevos rapidamente, traducir objetivos de negocio a ejecucion tecnica y crear sistemas mas claros para que los equipos avanzaran con menos friccion.',
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
          title: 'Soporte, Linux, automatizacion y el paso hacia software',
          description:
            'La etapa inicial no fue glamorosa, pero si formativa. El trabajo de soporte construyo intuicion profunda sobre Linux, telefonia, networking y troubleshooting. Los problemas operativos repetitivos se fueron transformando en scripts, dashboards y automatizaciones, haciendo que el salto a software engineering se sintiera menos como un cambio brusco y mas como una extension natural de resolver problemas.',
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
};

content.en.projectsList = projects.en;
content.en.featuredProjects = [projects.en[0], projects.en[1], projects.en[3]];
content.es.projectsList = projects.es;
content.es.featuredProjects = [projects.es[0], projects.es[1], projects.es[3]];

export const getSiteContent = (locale: Locale) => content[locale];
