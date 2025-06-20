import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-about-me',
  imports: [],
  templateUrl: './about-me.html',
  styleUrl: './about-me.css',
})
export class AboutMe {
  @HostBinding('class') readonly cls = /* tw */ 'block';
}
