import { alert } from '@visomi-stack/web-frontend-ui/lib/feedback';
import { button } from '@visomi-stack/web-frontend-ui/lib/button';
import { input, select, textarea } from '@visomi-stack/web-frontend-ui/lib/forms';
import { card, container } from '@visomi-stack/web-frontend-ui/lib/layout';
import { heading, link, text } from '@visomi-stack/web-frontend-ui/lib/typography';

// The portfolio owns colors, typography, spacing and composition. Shared foundations
// supply behavior and intrinsic sizing without competing visual utilities.
export const ui = {
  alert: alert.foundation,
  button: button.foundation,
  link: link.foundation,
  input: input.foundation,
  select: select.foundation,
  textarea: textarea.foundation,
  card: card.foundation,
  container: container.foundation,
  heading: heading.foundation({ wrap: 'wrap' }),
  text: text.foundation({ wrap: 'wrap' }),
} as const;
