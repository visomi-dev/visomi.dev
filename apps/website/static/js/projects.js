document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !cards.length) return;

  const ACTIVE_CLASSES = [
    'bg-primary-light',
    'dark:bg-primary-dark',
    'border-transparent',
    'text-white',
    'dark:text-black',
  ];
  const INACTIVE_CLASSES = [
    'border-border-light',
    'dark:border-border-dark',
    'text-muted-light',
    'dark:text-muted-dark',
    'hover:border-primary-light',
    'dark:hover:border-primary-dark',
    'bg-transparent',
  ];

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update button styles
      filterBtns.forEach((b) => {
        b.classList.remove(...ACTIVE_CLASSES);
        b.classList.add(...INACTIVE_CLASSES);
      });

      btn.classList.remove(...INACTIVE_CLASSES);
      btn.classList.add(...ACTIVE_CLASSES);

      // Filter cards
      cards.forEach((card) => {
        if (filter === 'ALL' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
