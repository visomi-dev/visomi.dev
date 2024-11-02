import { Component, HostBinding, Input } from '@angular/core';

type Item = {
  name: string;
  percent: number;
  color: string;
};

@Component({
  selector: 'app-character-sheet-list',
  standalone: true,
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class CharacterSheetListComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  @Input({
    required: true,
  })
  items: Item[] = [];
}
