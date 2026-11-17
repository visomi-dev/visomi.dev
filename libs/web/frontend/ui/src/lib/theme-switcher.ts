const foundation =
  'ui-theme-switcher relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden ui-focus-ring disabled:cursor-wait motion-reduce:transition-none';

const sunFoundation = 'ui-theme-sun pointer-events-none absolute dark:-translate-y-16 dark:opacity-0';
const moonFoundation =
  'ui-theme-moon pointer-events-none absolute -translate-y-16 opacity-0 dark:translate-y-0 dark:opacity-100';

export const themeSwitcher = {
  foundation,
  classes(): string {
    return `${foundation} size-11 rounded-md transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800`;
  },
  sunFoundation,
  moonFoundation,
  sunClasses: `${sunFoundation} size-7 text-yellow-700`,
  moonClasses: `${moonFoundation} size-6 text-white`,
  sunPath:
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  moonPath:
    'M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
} as const;
