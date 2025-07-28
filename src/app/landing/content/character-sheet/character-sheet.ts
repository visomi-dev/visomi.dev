import { Component, HostBinding, inject } from '@angular/core';

import { Stats } from '../../stats';
import { nav } from '../../constants';

import { List } from './list/list';

@Component({
  selector: 'app-character-sheet',
  imports: [List],
  templateUrl: './character-sheet.html',
  styleUrl: './character-sheet.css',
})
export class CharacterSheet {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  private readonly stats = inject(Stats);

  nav = nav;

  codingTime = this.stats.codingTime;
  languages = this.stats.languages;
  editors = this.stats.editors;
  operatingSystems = this.stats.operatingSystems;
  categories = this.stats.categories;
}
