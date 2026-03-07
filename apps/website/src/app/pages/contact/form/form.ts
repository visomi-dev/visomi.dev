import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Input as AppInput } from '../../../shared/ui/form/input/input';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, AppInput],
  templateUrl: './form.html',
  styleUrl: './form.css',

  host: {
    class: /* tw */ 'grid md:col-span-7 md:col-start-6',
  },
})
export class Form {
  private readonly fb = inject(FormBuilder);

  readonly contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    type: ['consulting', Validators.required],
    message: ['', Validators.required],
  });
}
