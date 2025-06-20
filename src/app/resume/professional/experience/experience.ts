import { Component, HostBinding } from '@angular/core';

type Job = {
  company: string;
  logo: string;
  title: string;
  start: string;
  description: string;
  logoAlt?: string;
  end?: string;
};

@Component({
  selector: 'app-experience',
  imports: [],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience {
  @HostBinding('class') readonly cls = /* tw */ 'block';

  readonly jobs: Job[] = [
    {
      company: 'AB InBev',
      logo: 'assets/images/resume/logos/ab-inbev.svg',
      logoAlt: 'AB InBev Logo',
      title: $localize`:@@resumeExpABITitle:Tech Lead`,
      description: $localize`:@@resumeExpABIDesc:Design and develop a new Archit with React, Node.js on Azure; Develop a Web Scraper and Power BI reports.`,
      start: $localize`:@@resumeExpABIStart:Aug 2022`,
    },
    {
      company: 'Solidus Capital',
      logo: 'assets/images/resume/logos/solidus-capital.svg',
      logoAlt: 'Solidus Capital Logo',
      title: $localize`:@@resumeExpSCTitle:Head of Tech`,
      description: $localize`:@@resumeExpSCDesc:Design and develop a new Archit with React, Node.js, SLS and AWS; Team Management and Product Development.`,
      start: $localize`:@@resumeExpSCStart:Jul 2021`,
      end: $localize`:@@resumeExpSCEnd:Jul 2022`,
    },
    {
      company: 'Kavak',
      logo: 'assets/images/resume/logos/kavak.svg',
      logoAlt: 'Kavak Logo',
      title: $localize`:@@resumeExpKavakTitle:Chapter Lead`,
      description: $localize`:@@resumeExpKavakDesc:Migration to NX and AWS, develop with Angular and SLS; use of multiple databases, AWS Cognito integration.`,
      start: $localize`:@@resumeExpKavakStart:Aug 2020`,
      end: $localize`:@@resumeExpKavakEnd:Jun 2021`,
    },
    {
      company: 'Avanttia',
      logo: 'assets/images/resume/logos/avanttia.svg',
      logoAlt: 'Avanttia Logo',
      title: $localize`:@@resumeExpAvanttiaTitle:Tech Lead`,
      description: $localize`:@@resumeExpAvanttiaDesc:Design and develop a new Archit of fiscal apps with Node.js, PostgreSQL, Vue, and SAT services. Team management.`,
      start: $localize`:@@resumeExpAvanttiaStart:Oct 2018`,
      end: $localize`:@@resumeExpAvanttiaEnd:Jul 2020`,
    },
    {
      company: 'Creze',
      logo: 'assets/images/resume/logos/creze.svg',
      logoAlt: 'Creze Logo',
      title: $localize`:@@resumeExpCrezeTitle:Tech Lead`,
      description: $localize`:@@resumeExpCrezeDesc:Develop web apps with React, Node.js, PostgreSQL; create Vue dashboards and deploy to AWS.`,
      start: $localize`:@@resumeExpCrezeStart:Jun 2017`,
      end: $localize`:@@resumeExpCrezeEnd:Aug 2018`,
    },
  ];
}
