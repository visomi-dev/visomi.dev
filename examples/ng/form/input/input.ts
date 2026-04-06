import { booleanAttribute, Component, computed, effect, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  readonly form = input.required<FormGroup>();
  readonly name = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly label = input<string | undefined>();
  readonly type = input<
    'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'
  >('text');
  readonly pattern = input<string | undefined>();
  readonly autocomplete = input<string | undefined>();
  readonly minLength = input<string | number | undefined>();
  readonly maxLength = input<string | number | undefined>();
  readonly min = input<string | number | undefined>();
  readonly max = input<string | number | undefined>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input<string | undefined>();
  readonly help = input<string | undefined>();
  readonly step = input<string | number | undefined>();
  readonly inputId = input<string | undefined>();
  readonly inputClass = input<string | undefined>();
  readonly labelClass = input<string | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly idComputed = computed(() => {
    return this.inputId() ?? this.name();
  });

  readonly inputClassComputed = computed(() => {
    const inputClassComputed = [
      /* tw */ 'w-full appearance-none rounded-md border-2 border-slate-400 bg-transparent px-3 py-2 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    ];

    const inputClass = this.inputClass();

    if (inputClass) {
      inputClassComputed.push(inputClass);
    }

    if (this.loading()) {
      inputClassComputed.push(
        /* tw */ 'pointer-events-none relative flex items-center justify-center opacity-90 !text-transparent after:absolute after:block after:h-[1em] after:w-[1em] after:animate-spin after:rounded-full after:border-2 after:border-r-transparent after:border-t-transparent',
      );
    }

    return inputClassComputed.join(' ');
  });

  readonly requiredComputed = computed(() => {
    const required = this.required();

    return required ? true : undefined;
  });

  readonly readonlyComputed = computed(() => {
    const readonly = this.readonly();

    return readonly ? true : undefined;
  });

  readonly disabledEffect = effect(() => {
    const control = this.form().get(this.name());
    const disabled = this.disabled();

    if (disabled == undefined || !control) {
      return;
    }

    if (disabled) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  });
}
