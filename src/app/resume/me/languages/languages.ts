import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-languages',
  imports: [],
  templateUrl: './languages.html',
  styleUrl: './languages.css',
})
export class Languages {
  @HostBinding('class') readonly cls = /* tw */ 'block';
}
