import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.css',
})
export class CharacterSheetComponent {
  @HostBinding('class') readonly class = /* tw */ 'flex flex-col w-full';
}
