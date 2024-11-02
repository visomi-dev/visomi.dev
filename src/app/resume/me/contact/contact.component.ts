import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';
}
