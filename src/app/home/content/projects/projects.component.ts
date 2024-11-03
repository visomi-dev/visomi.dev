import { Component, HostBinding } from '@angular/core';
import { NgClass } from '@angular/common';

import { nav } from '../../constants';

type Project = {
  id: string;
  title: string;
  caption: string;
  description: string;
  technologies: {
    name: string;
    color: string;
  }[];
  preview: string;
  link: string;
  wip: boolean;
};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgClass],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  nav = nav;

  projects: Project[] = [
    {
      id: 'nive',
      title: 'Nive',
      caption: $localize`:@@homeContentProjectNiveCaption:from financial chaos to nirvana`,
      description: $localize`:@@homeContentProjectNiveDesc:Nive is a personal finance management app that helps you to control your money.`,
      technologies: [
        {
          name: 'Angular',
          color: /* tw */ 'bg-red-300',
        },
        {
          name: 'Nest',
          color: /* tw */ 'bg-gray-400',
        },
      ],
      preview: 'assets/images/nive-preview.png',
      link: 'https://nive.visomi.dev',
      wip: true,
    },
  ];
}
