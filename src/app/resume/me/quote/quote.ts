import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-quote',
  imports: [],
  templateUrl: './quote.html',
  styleUrl: './quote.css',
})
export class Quote {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';
}
