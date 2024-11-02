import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [],
  templateUrl: './languages.component.html',
  styleUrl: './languages.component.css',
})
export class LanguagesComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block';
}
