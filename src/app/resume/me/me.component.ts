import { Component, HostBinding } from '@angular/core';

import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { QuoteComponent } from './quote/quote.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [PersonalInfoComponent, QuoteComponent, ContactComponent],
  templateUrl: './me.component.html',
  styleUrl: './me.component.css',
})
export class MeComponent {
  @HostBinding('class') readonly class = /* tw */ 'block w-full min-h-full';
}