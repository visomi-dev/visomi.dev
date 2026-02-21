import { Component, HostBinding } from '@angular/core';

import { nav } from '../../constants';

type WebLink = {
  label: string;
  href: string;
};

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  nav = nav;

  webLinks: WebLink[] = [
    {
      label: 'GitHub',
      href: 'https://github.com/visomi-dev',
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
