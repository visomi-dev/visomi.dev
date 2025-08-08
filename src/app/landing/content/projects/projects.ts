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
  previewWidth: number;
  previewHeight: number;
  link: string;
  wip: boolean;
};

@Component({
  selector: 'app-projects',
  imports: [NgClass],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
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
          name: 'Express.js',
          color: /* tw */ 'bg-black text-white',
        },
      ],
      preview: 'assets/images/nive-preview.webp',
      previewWidth: 240,
      previewHeight: 485,
      link: 'https://nive.visomi.dev',
      wip: true,
    },
  ];
}
