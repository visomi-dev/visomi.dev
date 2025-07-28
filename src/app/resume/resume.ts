import { Component, HostBinding, inject, OnInit } from '@angular/core';

import { SEO } from '../shared/seo';

import { Me } from './me/me';
import { Professional } from './professional/professional';

@Component({
  selector: 'app-resume',
  imports: [Me, Professional],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class Resume implements OnInit {
  @HostBinding('class') readonly cls =
    /* tw */ 'no-scroll-print mx-auto flex flex-col w-full md:h-[27.9cm] md:w-[21.6cm] md:flex-row';

  private readonly seo = inject(SEO);

  ngOnInit(): void {
    this.seo.configure({
      title: $localize`:@@resumeTitle:Resume`,
      description: $localize`:@@resumeDescription:A detailed overview of my professional experience, skills, and accomplishments.`,
      url: 'https://visomi.dev/',
      preview: 'https://visomi.dev/assets/images/galaxy-illustration.svg',
      index: true,
      follow: true,
    });
  }
}
