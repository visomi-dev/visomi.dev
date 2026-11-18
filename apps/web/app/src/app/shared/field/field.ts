import { booleanAttribute, Component, computed, input } from '@angular/core';

import { description, errorMessage, field as styles, label } from '@visomi-stack/web-frontend-ui/lib/forms';

@Component({
  selector: 'app-field',
  exportAs: 'appField',
  templateUrl: './field.html',
  styleUrl: './field.css',
  host: {
    'data-control': '',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.data-manual-invalid]': 'manualError()?.trim() ? "" : null',
    '[class]': 'classes()',
  },
})
export class Field {
  readonly compact = input(false, { transform: booleanAttribute });
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input('');
  readonly error = input('');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly manualError = input<string | null>(null);

  protected readonly classes = computed(() => styles.classes({ compact: this.compact() }));
  readonly descriptionId = computed(() => `${this.controlId()}-help`);
  readonly errorId = computed(() => `${this.controlId()}-error`);
  readonly message = computed(() => this.manualError()?.trim() || this.error().trim());
  readonly describedBy = computed(() => {
    const ids = [this.description() ? this.descriptionId() : null, this.message() ? this.errorId() : null];

    return ids.filter(Boolean).join(' ') || null;
  });

  protected readonly labelClasses = label.classes();
  protected readonly descriptionClasses = description.classes();
  protected readonly errorClasses = errorMessage.classes();
}
