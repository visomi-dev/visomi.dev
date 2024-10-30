import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  @HostBinding('class') readonly class = /* tw */ 'flex flex-col w-full';
}
