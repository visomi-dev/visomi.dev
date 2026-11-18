import { Component } from '@angular/core';

import { errorMessage as styles } from '@visomi-stack/web-frontend-ui/lib/forms';

@Component({
  selector: 'p[app-error]',
  templateUrl: './error-message.html',
  styleUrl: './error-message.css',
  host: { 'data-slot': 'error', 'aria-live': 'polite', 'aria-atomic': 'true', '[class]': 'classes' },
})
export class ErrorMessage {
  protected readonly classes = styles.classes();
}
