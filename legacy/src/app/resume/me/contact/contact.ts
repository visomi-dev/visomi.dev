import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';
}
