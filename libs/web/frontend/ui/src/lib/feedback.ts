import { toneClasses, type Tone } from './data';

const alertFoundation = 'grid gap-2';

export const alert = {
  foundation: alertFoundation,
  classes({ tone = 'accent' }: { tone?: Tone } = {}): string {
    return [`${alertFoundation} rounded-xl border p-4 text-sm leading-6`, toneClasses[tone]].join(' ');
  },
} as const;
export const loader = {
  classes(): string {
    return 'ui-loader inline-block size-5 shrink-0 text-blue-600 dark:text-blue-400';
  },
} as const;
