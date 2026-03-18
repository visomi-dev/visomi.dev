const html = document.documentElement;
const labels = document.querySelectorAll<HTMLElement>('.theme-switch-label');

const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let isDark = savedTheme === 'dark' || (!savedTheme && systemDark);

if (isDark) {
  html.classList.add('dark');
} else {
  html.classList.remove('dark');
}

const syncIcons = (label: HTMLElement, dark: boolean, animate: boolean) => {
  const input = label.querySelector<HTMLInputElement>('.theme-switch-input');
  const iconLight = label.querySelector<HTMLElement>('.theme-icon-light');
  const iconDark = label.querySelector<HTMLElement>('.theme-icon-dark');

  if (!input || !iconLight || !iconDark) {
    return;
  }

  input.checked = dark;

  if (!animate) {
    iconLight.classList.remove('upward-enter', 'upward-leave');
    iconDark.classList.remove('upward-enter', 'upward-leave');
    iconLight.classList.toggle('hidden', dark);
    iconDark.classList.toggle('hidden', !dark);
    return;
  }

  if (dark) {
    iconLight.classList.remove('upward-enter');
    iconLight.classList.add('upward-leave');

    window.setTimeout(() => {
      iconLight.classList.add('hidden');
      iconDark.classList.remove('hidden', 'upward-leave');
      iconDark.classList.add('upward-enter');
    }, 350);
    return;
  }

  iconDark.classList.remove('upward-enter');
  iconDark.classList.add('upward-leave');

  window.setTimeout(() => {
    iconDark.classList.add('hidden');
    iconLight.classList.remove('hidden', 'upward-leave');
    iconLight.classList.add('upward-enter');
  }, 350);
};

const toggleTheme = (event?: Event) => {
  if (event?.type === 'click') {
    event.preventDefault();
  }

  isDark = !html.classList.contains('dark');
  html.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  labels.forEach((label) => {
    syncIcons(label, isDark, true);
  });
};

labels.forEach((label) => {
  syncIcons(label, isDark, false);

  label.addEventListener('click', toggleTheme);
  label.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  });
});
