const loader = document.getElementById('page-navigation-loader');

if (loader) {
  document.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest<HTMLAnchorElement>('a');

    if (
      link &&
      link.href &&
      !link.href.startsWith('mailto:') &&
      !link.href.startsWith('tel:') &&
      !link.hasAttribute('target') &&
      link.hostname === window.location.hostname &&
      link.pathname !== window.location.pathname &&
      !link.href.includes('#')
    ) {
      loader.classList.remove('hidden', 'in-out-leave');
      loader.classList.add('in-out-enter');
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) {
      return;
    }

    loader.classList.remove('in-out-enter');
    loader.classList.add('in-out-leave');

    window.setTimeout(() => {
      loader.classList.add('hidden');
    }, 400);
  });
}
