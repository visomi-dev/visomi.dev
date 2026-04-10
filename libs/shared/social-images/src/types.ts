const locales = ['en', 'es'] as const;
const pages = ['home', 'journey', 'projects', 'resume', 'contact'] as const;

const SOCIAL_IMAGE_QUEUE_NAME = 'social-images';
const GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME = 'generate-page-social-image';
const GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME = 'generate-website-social-images';
const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;

type Locale = (typeof locales)[number];
type PageId = (typeof pages)[number];

type SocialImageTarget = {
  locale: Locale;
  page: PageId;
};

type SocialImageCardInput = {
  accent: string;
  cta: string;
  eyebrow: string;
  highlights: string[];
  locale: Locale;
  page: PageId;
  subtitle: string;
  title: string;
};

type SocialImageCardModel = SocialImageCardInput & {
  accent: string;
  cta: string;
  highlights: string[];
  previewLabel: string;
  subtitle: string;
  title: string;
};

type GeneratePageSocialImageJob = {
  runId?: string;
  target: SocialImageTarget;
};

type GenerateWebsiteSocialImagesJob = {
  runId?: string;
  targets?: SocialImageTarget[];
};

type SocialImageArtifact = {
  locale: Locale;
  page: PageId;
  publicRelativePath: string;
  tempFilePath: string;
};

type SocialImageBatchResult = {
  artifacts: SocialImageArtifact[];
  generatedAt: string;
  manifestPath: string;
  ruleSet: string[];
  runId: string;
};

export {
  GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME,
  GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME,
  locales,
  pages,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_QUEUE_NAME,
  SOCIAL_IMAGE_WIDTH,
};
export type {
  GeneratePageSocialImageJob,
  GenerateWebsiteSocialImagesJob,
  Locale,
  PageId,
  SocialImageArtifact,
  SocialImageBatchResult,
  SocialImageCardInput,
  SocialImageCardModel,
  SocialImageTarget,
};
