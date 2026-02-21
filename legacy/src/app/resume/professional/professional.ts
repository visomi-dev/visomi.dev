import { Component } from '@angular/core';

import { AboutMe } from './about-me/about-me';
import { Experience } from './experience/experience';
import { TechPreferences } from './tech-preferences/tech-preferences';

@Component({
  selector: 'app-professional',
  imports: [AboutMe, Experience, TechPreferences],
  templateUrl: './professional.html',
  styleUrl: './professional.css',
})
export class Professional {}
