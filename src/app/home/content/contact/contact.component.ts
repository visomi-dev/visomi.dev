import { Component, HostBinding } from '@angular/core';

import { nav } from '../../constants';

type WebLink = {
  label: string;
  href: string;
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  @HostBinding('class') readonly class = /* tw */ 'block w-full';

  nav = nav;

  webLinks: WebLink[] = [
    {
      label: 'GitHub',
      href: 'https://github.com/visomi-dev',
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/visomi_dev',
    },
    {
      label: 'Linkedin',
      href: 'https://www.linkedin.com/in/visomi',
    },
    {
      label: 'WakaTime',
      href: 'https://wakatime.com/@visomi',
    },
  ];
}
