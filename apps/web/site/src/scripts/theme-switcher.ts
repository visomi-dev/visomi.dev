type ThemePreference = 'light' | 'dark' | 'system';

let preference: ThemePreference = 'system';
let bound = false;
let transitionTimer: ReturnType<typeof setTimeout> | undefined;
let transitionFrame = 0;

const readPreference = () => {
  try {
    const stored = localStorage.getItem('theme');

    preference = stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Keep the in-memory choice when persistence is unavailable.
  }
};

const endTransition = () => {
  delete document.documentElement.dataset['themeTransition'];
  for (const control of document.querySelectorAll<HTMLElement>('[data-theme-switcher]')) {
    delete control.dataset['themeAnimated'];
  }
};

const apply = (animate = false) => {
  const root = document.documentElement;
  const dark =
    preference === 'system'
      ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
      : preference === 'dark';
  const changed = root.classList.contains('dark') !== dark;
  const motion = animate && changed && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  clearTimeout(transitionTimer);
  cancelAnimationFrame(transitionFrame);

  if (motion) {
    const duration = Number(getComputedStyle(root).getPropertyValue('--ui-theme-duration-ms'));

    root.dataset['themeTransition'] = '';
    transitionFrame = requestAnimationFrame(() => {
      transitionTimer = setTimeout(endTransition, duration);
    });
  } else {
    endTransition();
  }

  root.classList.toggle('dark', dark);
  for (const control of document.querySelectorAll<HTMLButtonElement>('button[data-theme-switcher]')) {
    if (motion && !control.disabled) {
      control.dataset['themeAnimated'] = '';
    }

    control.setAttribute('aria-pressed', String(dark));
    control.disabled = false;
  }
};

export const initThemeSwitcher = () => {
  readPreference();
  apply();

  if (bound) {
    return;
  }

  bound = true;
  document.addEventListener('astro:page-load', () => {
    if (document.querySelector('button[data-theme-switcher]:disabled')) {
      initThemeSwitcher();
    }
  });
  document.addEventListener('click', (event) => {
    const control =
      event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-theme-switcher]') : null;

    if (!control || control.disabled) {
      return;
    }

    preference = document.documentElement.classList.contains('dark') ? 'light' : 'dark';

    try {
      localStorage.setItem('theme', preference);
    } catch {
      // A blocked storage policy must not disable the control.
    }

    apply(true);
  });
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (preference === 'system') {
      apply(true);
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme' || event.key === null) {
      readPreference();
      apply(true);
    }
  });
};

initThemeSwitcher();
