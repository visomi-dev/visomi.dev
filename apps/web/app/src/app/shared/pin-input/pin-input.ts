import {
  afterEveryRender,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { Field } from '../field/field';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.html',
  host: { class: /* tw */ 'block min-w-0 w-full', '[style.--digits]': 'digits()' },
  styleUrl: './pin-input.css',
})
export class PinInput {
  protected readonly field = inject(Field);

  readonly digits = input(6);
  readonly minlength = input<number>();
  readonly disabled = input(false);
  readonly autocomplete = input('off');
  readonly required = input(false, { transform: booleanAttribute });
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  protected readonly slots = computed(() => Array.from({ length: this.digits() }, (_, index) => index));
  protected readonly minDigits = computed(() => this.minlength() ?? this.digits());
  protected readonly pattern = computed(() => `[0-9]{${this.minDigits()},${this.digits()}}`);

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected paste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text/plain') ?? '';
    const digits = text.replace(/[^0-9]/g, '');

    if (text === digits) {
      return;
    }

    // Normalize before the browser applies maxlength to the pasted text.
    event.preventDefault();
    const control = this.control().nativeElement;
    const start = control.selectionStart ?? control.value.length;
    const end = control.selectionEnd ?? start;
    const available = this.digits() - (control.value.length - (end - start));

    if (digits && available > 0) {
      control.setRangeText(digits.slice(0, available), start, end, 'end');
      this.valueChange.emit(control.value);
    }
  }

  // The browser can edit the value and the owner can clear it before Angular renders again.
  // Compare against the live control so clearing wins and ordinary edits keep native selection.
  private readonly syncValue = afterEveryRender({
    write: () => {
      const control = this.control().nativeElement;
      const value = this.value();

      if (control.value !== value) {
        control.value = value;
      }
    },
  });
}
