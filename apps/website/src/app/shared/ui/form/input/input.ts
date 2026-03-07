import { booleanAttribute, Component, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input<string>();
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'tel' | 'url'>('text');
  readonly id = input<string>();
  readonly required = input(false, { transform: booleanAttribute });

  readonly inputId = computed(() => this.id() || Math.random().toString(36).substring(2, 9));
}
