import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.css',
})
export class QuoteComponent {
  @HostBinding('class') readonly class = /* tw */ 'block w-full';
}
