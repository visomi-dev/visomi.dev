export const initNavbar = () => {
  const attach = () => {
    const button = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    if (!button || !menu) {
      return;
    }

    if (button.dataset['navbarBound'] === 'true') {
      return;
    }

    button.dataset['navbarBound'] = 'true';
    button.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  };

  attach();
  document.addEventListener('astro:page-load', attach);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}
