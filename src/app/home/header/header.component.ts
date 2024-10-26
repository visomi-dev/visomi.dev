import { Component, HostBinding, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { nav } from '../constants';

type NavItem = {
  label: string;
  href: string;
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
  @HostBinding('class') readonly class = /* tw */ 'flex flex-col';

  readonly open = signal(false);

  readonly items: NavItem[] = [
    {
      label: $localize`:@@homeHeaderIntroduction:Hi`,
      href: `/#${nav.introduction}`,
      color: /* tw */ 'text-yellow-500',
    },
    {
      label: $localize`:@@homeHeaderAboutMe:About Me`,
      href: `/#${nav.aboutMe}`,
      color: /* tw */ 'text-blue-700',
    },
    {
      label: $localize`:@@homeHeaderProjects:Projects`,
      href: `/#${nav.projects}`,
      color: /* tw */ 'text-green-700',
    },
    {
      label: $localize`:@@homeHeaderCharacterSheet:CS`,
      href: `/#${nav.characterSheet}`,
      color: /* tw */ 'text-red-500',
    },
    {
      label: $localize`:@@homeHeaderContact:Contact`,
      href: `/#${nav.contact}`,
      color: /* tw */ 'text-slate-700',
    },
    {
      label: $localize`:@@homeHeaderResume:Resume`,
      href: $localize`:@@homeHeaderResumeLink:/resume`,
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
