import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-socials',
  imports: [],
  templateUrl: './socials.html',
  styleUrl: './socials.css',
})
export class Socials {
  @HostBinding('class') class = /* tw */ 'block';
}
