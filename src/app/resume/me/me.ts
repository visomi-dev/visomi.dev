import { Component, HostBinding } from '@angular/core';

import { PersonalInfo } from './personal-info/personal-info';
import { Quote } from './quote/quote';
import { Contact } from './contact/contact';
import { Socials } from './socials/socials';
import { Languages } from './languages/languages';

@Component({
  selector: 'app-me',
  imports: [PersonalInfo, Quote, Contact, Socials, Languages],
  templateUrl: './me.html',
  styleUrl: './me.css',
})
export class Me {
  @HostBinding('class') readonly cls = /* tw */ 'block';
}
