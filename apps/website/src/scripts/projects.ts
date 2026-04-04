export const initProjects = () => {
  const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const cards = document.querySelectorAll<HTMLElement>('.project-card');
  const previewButtons = document.querySelectorAll<HTMLButtonElement>('[data-project-thumb]');

  if (!cards.length) {
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

  if (filterButtons.length) {
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
  }

  previewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const slug = button.dataset.projectThumb;
      const imageSrc = button.dataset.imageSrc;
      const imageAlt = button.dataset.imageAlt;

      if (!slug || !imageSrc) {
        return;
      }

      const preview = document.querySelector<HTMLImageElement>(`[data-project-preview="${slug}"]`);

      if (!preview) {
        return;
      }

      preview.src = imageSrc;
      preview.alt = imageAlt ?? preview.alt;

      document.querySelectorAll<HTMLButtonElement>(`[data-project-thumb="${slug}"]`).forEach((item) => {
        item.classList.remove('ring-primary-light', 'dark:ring-primary-dark', 'ring-1');
      });

      button.classList.add('ring-primary-light', 'dark:ring-primary-dark', 'ring-1');
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjects);
} else {
  initProjects();
}
