(function () {
  const html = document.documentElement;
  // We select all in case there are multiple on the page
  const labels = document.querySelectorAll('.theme-switch-label');

  // Initial load
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let isDark = false;
  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    html.classList.add('dark');
    isDark = true;
  } else {
    html.classList.remove('dark');
    isDark = false;
  }

  labels.forEach((label) => {
    const input = label.querySelector('.theme-switch-input');
    const iconLight = label.querySelector('.theme-icon-light');
    const iconDark = label.querySelector('.theme-icon-dark');

    if (isDark) {
      input.checked = true;
      iconDark.classList.remove('hidden');
      iconDark.classList.add('upward-enter');
    } else {
      input.checked = false;
      iconLight.classList.remove('hidden');
      iconLight.classList.add('upward-enter');
    }

    function toggleTheme(e) {
      if (e && e.type === 'click') {
        e.preventDefault();
      }

      isDark = !html.classList.contains('dark');

      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Update all switchers
      labels.forEach((l) => {
        const inp = l.querySelector('.theme-switch-input');
        const iLight = l.querySelector('.theme-icon-light');
        const iDark = l.querySelector('.theme-icon-dark');

        inp.checked = isDark;

        if (isDark) {
          iLight.classList.remove('upward-enter');
          iLight.classList.add('upward-leave');

          setTimeout(() => {
            iLight.classList.add('hidden');
            iDark.classList.remove('hidden');
            iDark.classList.remove('upward-leave');
            iDark.classList.add('upward-enter');
          }, 350);
        } else {
          iDark.classList.remove('upward-enter');
          iDark.classList.add('upward-leave');

          setTimeout(() => {
            iDark.classList.add('hidden');
            iLight.classList.remove('hidden');
            iLight.classList.remove('upward-leave');
            iLight.classList.add('upward-enter');
          }, 350);
        }
      });
    }

    label.addEventListener('click', toggleTheme);

    label.addEventListener('keyup', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  });
})();
