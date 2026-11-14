const showDelay = 400;
const minimumVisibleTime = 250;
let navigationId = 0;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let shownAt: number | undefined;

function clearTimers() {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
}

function hide() {
  document.getElementById('page-navigation-loader')?.setAttribute('hidden', '');
  shownAt = undefined;
}

document.addEventListener('astro:before-preparation', (event) => {
  const load = event.loader;

  event.loader = async () => {
    const id = ++navigationId;

    clearTimers();

    const finish = () => {
      if (id !== navigationId) {
        return;
      }

      clearTimers();

      if (shownAt === undefined) {
        hide();
      } else {
        // Keep a briefly delayed indicator readable without delaying the route itself.
        hideTimer = setTimeout(hide, Math.max(0, minimumVisibleTime - (Date.now() - shownAt)));
      }
    };

    if (shownAt === undefined && !event.signal.aborted) {
      showTimer = setTimeout(() => {
        const loader = document.getElementById('page-navigation-loader');

        if (loader) {
          // The persisted node may still have the previous route's locale.
          const status = loader.querySelector('[role="status"]');

          if (status) {
            status.textContent = document.documentElement.lang === 'es' ? 'Cargando página' : 'Loading page';
          }

          loader.removeAttribute('hidden');
          shownAt = Date.now();
        }
      }, showDelay);
    }

    event.signal.addEventListener('abort', finish, { once: true });

    try {
      await load();
    } finally {
      event.signal.removeEventListener('abort', finish);
      finish();
    }
  };
});

window.addEventListener('pageshow', () => {
  navigationId++;
  clearTimers();
  hide();
});

export {};
