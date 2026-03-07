import { booleanAttribute, Component, computed, effect, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, startWith, switchMap } from 'rxjs';

import { RadioOption } from '../../../entities/ui';
import { Color, outlineColors, Size, sizes, solidColors } from '../../../constants/classes';
import { fadeHeight } from '../../animations';

@Component({
  selector: 'app-radio-buttons',
  imports: [ReactiveFormsModule],
  templateUrl: './radio-buttons.html',
  styleUrl: './radio-buttons.css',
  animations: [fadeHeight],
})
export class RadioButtons {
  readonly form = input.required<FormGroup>();
  readonly inputId = input<string | undefined>();
  readonly name = input.required<string>();
  readonly label = input<string | undefined>();
  readonly labelClass = input<string | undefined>();
  readonly options = input.required<RadioOption[]>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input<string | undefined>();
  readonly help = input<string>();
  readonly color = input<Color>('default');
  readonly size = input<Size>('md');

  readonly sizes = sizes;
  readonly solidColors = solidColors;
  readonly outlineColors = outlineColors;

  readonly gridSizes = new Map<number, string>([
    [2, /* tw */ 'grid-cols-2'],
    [3, /* tw */ 'grid-cols-3'],
    [4, /* tw */ 'grid-cols-4'],
    [5, /* tw */ 'grid-cols-5'],
    [6, /* tw */ 'grid-cols-6'],
  ]);

  readonly control = computed(() => {
    return this.form().get(this.name());
  });
  readonly controlObservable = toObservable(this.control);
  readonly valueChanges = toSignal(
    this.controlObservable.pipe(
      switchMap((control) => {
        if (!control) {
          return of(null);
        }

        return control.valueChanges.pipe(startWith(control.value));
      }),
    ),
    { initialValue: null },
  );

  readonly requiredComputed = computed(() => {
    const required = this.required();

    return required ? true : undefined;
  });

  readonly readonlyComputed = computed(() => {
    const readonly = this.readonly();

    return readonly ? true : undefined;
  });

  readonly gridClassComputed = computed(() => {
    const options = this.options();

    const gridClass = this.gridSizes.get(options.length) ?? this.gridSizes.get(2);

    return gridClass;
  });

  getId(value: string): string {
    if (this.inputId()) {
      return `${this.inputId()}-${value}`;
    }

    return `${this.name()}-${value}`;
  }

  getLabelClass({
    value,
    color,
    size,
    optionValue,
    optionsLength,
    index,
  }: {
    value: string;
    color: Color;
    size: Size;
    optionValue: string;
    optionsLength: number;
    index: number;
  }) {
    const labelClass = [
      /* tw */ 'relative cursor-pointer flex w-full hover:bg-teal-500 hover:border-teal-500 items-center justify-center gap-2 border-2 focus:outline-none focus:ring-offset-4 focus:ring-offset-soft-gray disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-black md:focus:ring-2',
      value === optionValue ? solidColors[color] : outlineColors[color],
      sizes[size],
    ];

    if (index === 0) {
      labelClass.push(/* tw */ 'rounded-l-lg');
    }
    if (index === optionsLength - 1) {
      labelClass.push(/* tw */ 'rounded-r-lg');
    }

    return labelClass.join(' ');
  }

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
