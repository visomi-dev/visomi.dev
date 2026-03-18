document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const cards = document.querySelectorAll<HTMLElement>('.project-card');

  if (!filterButtons.length || !cards.length) {
    return;
  }

  const activeClasses = [
    'bg-primary-light',
    'dark:bg-primary-dark',
    'border-transparent',
    'text-white',
    'dark:text-black',
  ];
  const inactiveClasses = [
    'border-border-light',
    'dark:border-border-dark',
    'text-muted-light',
    'dark:text-muted-dark',
    'hover:border-primary-light',
    'dark:hover:border-primary-dark',
    'bg-transparent',
  ];

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        item.classList.remove(...activeClasses);
        item.classList.add(...inactiveClasses);
      });

      button.classList.remove(...inactiveClasses);
      button.classList.add(...activeClasses);

      cards.forEach((card) => {
        card.style.display = filter === 'ALL' || card.dataset.category === filter ? '' : 'none';
      });
    });
  });
});
