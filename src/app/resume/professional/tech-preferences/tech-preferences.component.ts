import { Component, HostBinding } from '@angular/core';

type Preference = {
  name: string;
  logo: string;
};

@Component({
  selector: 'app-tech-preferences',
  standalone: true,
  imports: [],
  templateUrl: './tech-preferences.component.html',
  styleUrl: './tech-preferences.component.css',
})
export class TechPreferencesComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block';

  preferences: Preference[] = [
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
      name: 'Angular',
      logo: 'assets/images/resume/logos/angular.svg',
    },
    {
      name: 'NestJS',
      logo: 'assets/images/resume/logos/nestjs.svg',
    },
    {
      name: 'Flutter',
      logo: 'assets/images/resume/logos/flutter.svg',
    },
  ];
}
