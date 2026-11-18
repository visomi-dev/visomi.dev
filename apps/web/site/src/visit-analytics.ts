import { trackVisits } from '@visomi-stack/web-shared-observability/lib/visit-browser';

trackVisits(window, (path) => {
  const known = /^\/(es\/)?(?:(journey|projects|resume|contact)\/)?$/.exec(path);

  if (known) {
    return { locale: known[1] ? 'es' : 'en', page: known[2] ?? 'home' };
  }

  return;
});
