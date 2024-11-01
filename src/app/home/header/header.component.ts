import { Component, HostBinding, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { nav } from '../constants';

type NavItem = {
  label: string;
  routerLink: string;
  fragment?: string;
  color: string;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @HostBinding('class') readonly class = /* tw */ 'block';

  readonly open = signal(false);

  readonly items: NavItem[] = [
    {
      label: $localize`:@@homeHeaderIntroduction:Hi`,
      routerLink: `.`,
      fragment: nav.introduction,
      color: /* tw */ 'text-yellow-500',
    },
    {
      label: $localize`:@@homeHeaderAboutMe:About Me`,
      routerLink: `.`,
      fragment: nav.aboutMe,
      color: /* tw */ 'text-blue-700',
    },
    {
      label: $localize`:@@homeHeaderProjects:Projects`,
      routerLink: `.`,
      fragment: nav.projects,
      color: /* tw */ 'text-green-700',
    },
    {
      label: $localize`:@@homeHeaderCharacterSheet:CS`,
      routerLink: `.`,
      fragment: nav.characterSheet,
      color: /* tw */ 'text-red-500',
    },
    {
      label: $localize`:@@homeHeaderContact:Contact`,
      routerLink: `.`,
      fragment: nav.contact,
      color: /* tw */ 'text-slate-700',
    },
    {
      label: $localize`:@@homeHeaderResume:Resume`,
      routerLink: $localize`:@@homeHeaderResumeLink:resume`,
      color: /* tw */ 'text-indigo-600',
    },
  ];

  toggleMenu() {
    this.open.update((open) => !open);
  }

  closeMenu() {
    this.open.set(false);
  }
}
