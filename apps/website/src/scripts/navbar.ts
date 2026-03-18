document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
});
