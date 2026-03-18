import { Component, inject, type OnInit } from '@angular/core';

import { SEO } from '../../shared/seo';

import { Form } from './form/form';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-contact',
  imports: [Hero, Form],
  templateUrl: './contact.html',
  styleUrl: './contact.css',

  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black',
  },
})
export class Contact implements OnInit {
  private readonly seo = inject(SEO);

  ngOnInit(): void {
    this.seo.configure({
      title: $localize`:@@contactPageTitleMetadata:Contact | Michael Villalba`,
      description: $localize`:@@contactPageDescriptionMetadata:Get in touch with Michael Villalba for software engineering opportunities, collaborations, or technical consultations.`,
      url: 'https://visomi.dev/contact',
      preview: 'https://visomi.dev/assets/images/galaxy-illustration.webp',
      keywords: 'Michael Villalba, Contact, Software Engineer, Tech Lead, Collaboration',
    });
  }
}
