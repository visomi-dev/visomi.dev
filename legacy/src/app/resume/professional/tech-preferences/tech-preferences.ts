import { Component, HostBinding } from '@angular/core';

type Preference = {
  name: string;
  logo: string;
};

@Component({
  selector: 'app-tech-preferences',
  imports: [],
  templateUrl: './tech-preferences.html',
  styleUrl: './tech-preferences.css',
})
export class TechPreferences {
  @HostBinding('class') readonly cls = /* tw */ 'block';

  readonly preferences: Preference[] = [
    {
      name: 'TypeScript',
      logo: 'assets/images/resume/logos/typescript.svg',
    },
    {
      name: 'Go',
      logo: 'assets/images/resume/logos/golang.svg',
    },
    {
      name: 'Python',
      logo: 'assets/images/resume/logos/python.svg',
    },
    {
      name: 'C#',
      logo: 'assets/images/resume/logos/csharp.svg',
    },
    {
      name: 'Angular',
      logo: 'assets/images/resume/logos/angular.svg',
    },
  ];
}
