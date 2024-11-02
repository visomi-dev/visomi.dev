import { Component, HostBinding, inject } from '@angular/core';

import { nav } from '../../constants';
import { HomeService } from '../../home.service';

import { CharacterSheetListComponent } from './list/list.component';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CharacterSheetListComponent],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.css',
})
export class CharacterSheetComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  private readonly homeService = inject(HomeService);

  nav = nav;

  codingTime = this.homeService.codingTime;
  languagesStats = this.homeService.languagesStats;
  editorsStats = this.homeService.editorsStats;
  operatingSystemsStats = this.homeService.operatingSystemsStats;
  categoriesStats = this.homeService.categoriesStats;
}
