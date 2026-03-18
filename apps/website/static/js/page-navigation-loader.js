(function () {
  const loader = document.getElementById('page-navigation-loader');
  if (!loader) return;

  // Show loader immediately on navigation start
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
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
      loader.classList.remove('hidden');
      loader.classList.remove('in-out-leave');
      loader.classList.add('in-out-enter');
    }
  });

  // Hide loader when page is restored from bfcache
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      loader.classList.remove('in-out-enter');
      loader.classList.add('in-out-leave');
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 400);
    }
  });
})();
