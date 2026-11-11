import type { ImageMetadata } from 'astro';

export type ResumeExperience = {
  company: string;
  role: string;
  date: string;
  location: string;
  items: string[];
};

export type ResumeGroup = {
  label: string;
  items: string[];
};

export type JourneyStat = {
  label: string;
  value: string;
};

export type JourneyMetric = {
  label: string;
  value: string;
  meta?: string;
  tone?: 'success' | 'default';
};

export type JourneyProgress = {
  label: string;
  value: string;
  percentage: number;
};

export type JourneyCodeLang = 'py' | 'text' | 'ts';

export type JourneyEntry = {
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

export type ProjectScreenshot = {
  src: ImageMetadata;
  alt: string;
};

export type Project = {
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

export type HomeFeature = {
  title: string;
  subtitle: string;
  badge: string;
  lines: string[];
  tone: 'emerald' | 'blue' | 'neutral';
};

export type SiteContent = {
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
