export const visitPeriods = [7, 30] as const;

export type VisitPeriod = (typeof visitPeriods)[number];
export type VisitLocale = 'en' | 'es';
export type VisitPage = { page: string; locale: VisitLocale };
export type VisitCount = VisitPage & { day: string; views: number };
export type VisitSummary =
  { state: 'disabled' | 'unavailable' } | { state: 'ready'; period: VisitPeriod; firstDay: string; days: VisitCount[] };

export const siteVisitPages = ['home', 'journey', 'projects', 'resume', 'contact'] as const;

export function siteVisitPage(path: string): VisitPage | undefined {
  const match = /^\/(es\/)?(?:(journey|projects|resume|contact)\/)?$/.exec(path);

  return match ? { locale: match[1] ? 'es' : 'en', page: match[2] ?? 'home' } : undefined;
}
