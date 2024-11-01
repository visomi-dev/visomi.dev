import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-socials',
  standalone: true,
  imports: [],
  templateUrl: './socials.component.html',
  styleUrl: './socials.component.css',
})
export class SocialsComponent {
  @HostBinding('class') class = /* tw */ 'block';
}
