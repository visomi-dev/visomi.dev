type PageLoadHandler = () => void;

let onPageLoad: PageLoadHandler | null = null;

const applyTheme = () => {
  const savedTheme = window.localStorage?.getItem('theme');
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

  return savedTheme === 'dark' || (!savedTheme && systemDark);
};

const syncIcons = (html: HTMLElement) => {
  const isDark = html.classList.contains('dark');

  document.querySelectorAll<HTMLElement>('.theme-switch-label').forEach((label) => {
    const input = label.querySelector<HTMLInputElement>('.theme-switch-input');
    const iconLight = label.querySelector<HTMLElement>('.theme-icon-light');
    const iconDark = label.querySelector<HTMLElement>('.theme-icon-dark');

    if (!input || !iconLight || !iconDark) {
      return;
    }

    input.checked = isDark;

    if (isDark) {
      iconDark.classList.remove('hidden', 'upward-enter', 'upward-leave');
      iconLight.classList.add('hidden');
    } else {
      iconLight.classList.remove('hidden', 'upward-enter', 'upward-leave');
      iconDark.classList.add('hidden');
    }
  });
};

const toggleTheme = (html: HTMLElement) => {
  const nextIsDark = !html.classList.contains('dark');

  html.classList.toggle('dark', nextIsDark);
  window.localStorage?.setItem('theme', nextIsDark ? 'dark' : 'light');

  syncIcons(html);

  document.querySelectorAll<HTMLElement>('.theme-switch-label').forEach((label) => {
    const lightIcon = label.querySelector<HTMLElement>('.theme-icon-light');
    const darkIcon = label.querySelector<HTMLElement>('.theme-icon-dark');

    if (!lightIcon || !darkIcon) {
      return;
    }

    if (nextIsDark) {
      lightIcon.classList.remove('upward-enter');
      lightIcon.classList.add('upward-leave');

      window.setTimeout(() => {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden', 'upward-leave');
        darkIcon.classList.add('upward-enter');
      }, 350);
      return;
    }

    darkIcon.classList.remove('upward-enter');
    darkIcon.classList.add('upward-leave');

    window.setTimeout(() => {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden', 'upward-leave');
      lightIcon.classList.add('upward-enter');
    }, 350);
  });
};

const attachHandlers = (html: HTMLElement) => {
  document.querySelectorAll<HTMLElement>('.theme-switch-label').forEach((label) => {
    if (label.dataset['themeSwitchBound'] === 'true') {
      return;
    }

    label.dataset['themeSwitchBound'] = 'true';

    label.addEventListener('click', (event) => {
      event.preventDefault();
      toggleTheme(html);
    });

    label.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTheme(html);
      }
    });
  });
};

export const initThemeSwitcher = () => {
  const html = document.documentElement;

  if (!onPageLoad) {
    onPageLoad = () => {
      html.classList.toggle('dark', applyTheme());
      attachHandlers(html);
      syncIcons(html);
    };

    document.addEventListener('astro:page-load', onPageLoad);
  }

  html.classList.toggle('dark', applyTheme());
  attachHandlers(html);
  syncIcons(html);
};

initThemeSwitcher();
