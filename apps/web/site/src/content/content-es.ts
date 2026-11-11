import { year, currentFocusSnippet, architectureSnippet, foundationsSnippet } from './content-snippets';
import type { SiteContent } from './site-content.type';

export const esContent: SiteContent = {
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
          'Liderando la arquitectura frontend y backend de plataformas internas, con bases reutilizables, monorepos Nx, microfrontends, continuidad operativa entre ERP y operación e iniciativas de GenAI.',
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
    pageLabel: '',
    name: 'Michael Villalba Sotelo',
    headline: 'Ingeniero Full-Stack Senior | Lider tecnico | Arquitecto de software con IA aplicada',
    summary:
      'Ingeniero full-stack y lider tecnico con mas de 11 anos de experiencia construyendo plataformas web, sistemas internos, motores de automatizacion y arquitecturas orientadas a la experiencia de desarrollo en fintech, e-commerce, SaaS, entornos empresariales e iniciativas de IA.',
    location: 'Ciudad de Mexico, Mexico',
    email: 'visomi.dev@gmail.com',
    phone: '+52 220 377 2419',
    website: 'visomi.dev',
    github: 'github.com/visomi-dev',
    linkedin: 'linkedin.com/in/visomi',
    experienceLabel: 'Experiencia',
    stackLabel: 'Capacidades tecnicas',
    mentoringLabel: 'Mentoria',
    freelanceLabel: 'Freelance seleccionado',
    educationLabel: 'Educacion',
    languagesLabel: 'Idiomas',
    experience: [
      {
        company: 'AB InBev (Grupo Modelo)',
        role: 'Lider tecnico / Ingeniero full-stack senior',
        date: 'Ago 2022 - Presente',
        location: 'Mexico',
        items: [
          'Lidere la arquitectura frontend y backend de plataformas internas, priorizando bases reutilizables, sistemas de diseno, monorepos Nx, microfrontends y limites claros entre dominios.',
          'Disene la arquitectura y el modelo de entrega de una plataforma de continuidad operativa entre sistemas ERP y la operación, diseñada para mantener el trabajo activo cuando se perdía la conexión con el ERP, con plantillas compartidas, validación, middleware, servicios de dominio y contratos preparados para OpenAPI.',
          'Impulse la evolucion desde aplicaciones fragmentadas hacia un monorepo con Nx y patrones de microfrontend para mejorar escalabilidad, despliegues y reutilizacion.',
          'Disene y construi una plataforma de GenAI para flujos impulsados por agentes, combinando superficies React, servicios de dominio en Python, CrewAI, SDKs nativos de modelos y servicios reutilizables.',
          'Entregue un motor de web scraping configurable como iniciativa de automatizacion transitoria y acotada con NestJS, Puppeteer, BullMQ, Redis y SQLite; llego a MVP en 3 meses y a produccion en 6 meses.',
          'Cree bases reutilizables de frontend y backend para estandarizar la entrega entre equipos y mantener la automatizacion mediante actualizaciones ligeras basadas en configuracion.',
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
      title: 'Bachillerato general',
      school: 'Bachillerato tecnico en computacion cursado hasta cuarto semestre',
      date: 'Completado',
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
          'En AB InBev el enfoque se volvio mas amplio y mas duradero: arquitectura frontend y backend para una plataforma de continuidad operativa entre sistemas ERP y la operación, un sistema de diseno con bases reutilizables para multiples equipos, patrones de monorepo con Nx y microfrontends, y una plataforma de GenAI que combina frontends en React, servicios en Python y flujos con agentes. El scraping fue una automatizacion transitoria dentro de ese trabajo, no el centro de mi perfil.',
        metrics: [
          { label: 'Ventana MVP', value: '3 meses' },
          { label: 'Foco de arquitectura', value: 'Continuidad operativa', meta: 'ERP + operación' },
          { label: 'Enfoque actual', value: 'Plataforma GenAI', meta: 'React + Python + agentes' },
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
};
