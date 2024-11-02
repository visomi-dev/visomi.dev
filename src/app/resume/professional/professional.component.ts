import { Component, HostBinding } from '@angular/core';

import { AboutMeComponent } from './about-me/about-me.component';
import { ExperienceComponent } from './experience/experience.component';
import { TechPreferencesComponent } from './tech-preferences/tech-preferences.component';

@Component({
  selector: 'app-professional',
  standalone: true,
  imports: [AboutMeComponent, ExperienceComponent, TechPreferencesComponent],
  templateUrl: './professional.component.html',
  styleUrl: './professional.component.css',
})
export class ProfessionalComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block';
}
