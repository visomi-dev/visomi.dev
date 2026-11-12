import { year, currentFocusSnippet, architectureSnippet, foundationsSnippet } from './content-snippets';
import type { SiteContent } from './site-content.type';

export const enContent: SiteContent = {
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
    featuresSubtitle: 'Architecture, execution, and team enablement shaped by more than a decade of hands-on delivery.',
    journeyItems: [
      {
        year: '2022',
        role: 'Tech Lead / Senior Full-Stack Engineer',
        company: 'AB InBev',
        description:
          'Leading frontend and backend architecture for internal platforms, with reusable foundations, Nx monorepos, microfrontends, an operational continuity platform between ERP systems and frontline operations, and GenAI initiatives.',
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
    pageLabel: '',
    name: 'Michael Villalba Sotelo',
    headline: 'Senior Full-Stack Engineer | Tech Lead | AI-Enabled Software Architect',
    summary:
      'Full-stack software engineer and technical leader with 11+ years of experience building web platforms, internal systems, automation engines, and developer-focused architectures across fintech, e-commerce, SaaS, enterprise, and AI initiatives.',
    location: 'Mexico City, Mexico',
    email: 'visomi.dev@gmail.com',
    phone: '+52 220 377 2419',
    website: 'visomi.dev',
    github: 'github.com/visomi-dev',
    linkedin: 'linkedin.com/in/visomi',
    experienceLabel: 'Experience',
    stackLabel: 'Technical Skills',
    mentoringLabel: 'Mentoring',
    freelanceLabel: 'Selected Freelance',
    educationLabel: 'Education',
    languagesLabel: 'Languages',
    experience: [
      {
        company: 'AB InBev (Grupo Modelo)',
        role: 'Software Architect / Tech Lead / Senior Full-Stack Engineer',
        date: 'Aug 2022 - Present',
        location: 'Mexico',
        items: [
          'Led frontend and backend architecture for internal platforms, prioritizing reusable foundations, design systems, Nx monorepos, microfrontend ecosystems, and clear API boundaries.',
          'Designed the architecture and delivery model for an operational continuity platform between ERP systems and operations, keeping work moving when ERP connectivity was unavailable, while establishing shared templates, validation, middleware, domain services, and OpenAPI-ready contracts.',
          'Led the evolution from fragmented applications to Nx-based monorepo and microfrontend patterns for better scalability, release management, and code reuse.',
          'Designed and built a GenAI platform for agent-powered workflows, combining React operator surfaces, Python domain services, CrewAI orchestration, native model-provider SDKs, and reusable domain services.',
          'Delivered a configurable web-scraping engine as a focused transitional automation initiative using NestJS, Puppeteer, BullMQ, Redis, and SQLite; it reached MVP in 3 months and production approval in 6 months.',
          'Created reusable frontend and backend foundations that standardized delivery across teams and kept automation maintenance lightweight through configuration-driven updates.',
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
      title: 'General high school diploma',
      school: 'Technical high school in computing attended through 4th semester',
      date: 'Completed',
    },
    languages: ['Spanish: Native', 'English: Professional working proficiency (approximately B2 reading and writing)'],
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
          'At AB InBev, the focus became architecture that enables multiple teams to deliver: frontend and backend foundations for an operational continuity platform between ERP systems and frontline operations, a design system, Nx-based monorepo and microfrontend patterns, and a GenAI platform combining React frontends, Python services, and agent-based workflows. Web scraping was a focused transitional automation project within that broader platform work.',
        metrics: [
          { label: 'MVP Window', value: '3 months' },
          { label: 'Architecture Focus', value: 'Operational continuity', meta: 'ERP + frontline operations' },
          { label: 'Current Focus', value: 'GenAI platform', meta: 'React + Python + agents' },
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
};
