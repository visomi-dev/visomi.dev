import { Component, HostBinding } from '@angular/core';

import { IntroductionComponent } from './introduction/introduction.component';
import { AboutMeComponent } from './about-me/about-me.component';
import { ProjectsComponent } from './projects/projects.component';
import { CharacterSheetComponent } from './character-sheet/character-sheet.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    IntroductionComponent,
    AboutMeComponent,
    ProjectsComponent,
    CharacterSheetComponent,
    ContactComponent,
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.css',
})
export class ContentComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';
}
