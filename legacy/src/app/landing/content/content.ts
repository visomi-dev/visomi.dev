import { Component, HostBinding } from '@angular/core';

import { Introduction } from './introduction/introduction';
import { AboutMe } from './about-me/about-me';
import { Projects } from './projects/projects';
import { CharacterSheet } from './character-sheet/character-sheet';
import { Contact } from './contact/contact';

@Component({
  selector: 'app-content',
  imports: [Introduction, AboutMe, Projects, CharacterSheet, Contact],
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class Content {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';
}
