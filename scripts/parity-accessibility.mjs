// The only approved visual changes fix pre-existing AXE contrast failures.
// Applying colors to the original DOM leaves geometry, assets and text untouched.
export const accessibilityColorRules = [
  { pages: ['home'], before: ['text-muted-light/20', 'text-4xl'], after: ['text-muted-light/70', 'text-4xl'] },
  {
    pages: ['home'],
    before: ['text-emerald-600', 'border-emerald-100'],
    after: ['text-emerald-700', 'border-emerald-100'],
  },
  {
    pages: ['journey'],
    before: ['text-neutral-300', 'dark:text-neutral-800', 'text-2xl'],
    after: ['text-neutral-500', 'dark:text-neutral-500', 'text-2xl'],
  },
  {
    pages: ['journey'],
    before: ['text-neutral-400', 'dark:text-neutral-700'],
    after: ['text-neutral-600', 'dark:text-neutral-400'],
  },
  {
    pages: ['journey'],
    before: ['text-neutral-400', 'dark:text-neutral-600', 'pi-arrow-right'],
    after: ['text-neutral-600', 'dark:text-neutral-600', 'pi-arrow-right'],
  },
  {
    pages: ['journey', 'projects'],
    before: ['dark:text-neutral-500', 'text-muted-light'],
    after: ['dark:text-neutral-400', 'text-muted-light'],
  },
  {
    pages: ['contact'],
    before: ['text-muted-light/60', 'dark:text-muted-dark/40'],
    after: ['text-muted-light', 'dark:text-muted-dark'],
  },
];
