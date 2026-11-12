document.addEventListener('astro:before-preparation', (event) => {
  const loader = document.getElementById('page-navigation-loader');

  if (!loader) {
    return;
  }

  const load = event.loader;

  loader.classList.remove('hidden');
  event.loader = async () => {
    try {
      await load();
    } finally {
      // Finish on both success and failure, before ClientRouter swaps the document.
      loader.classList.add('hidden');
    }
  };
});

window.addEventListener('pageshow', () => {
  document.getElementById('page-navigation-loader')?.classList.add('hidden');
});

export {};
