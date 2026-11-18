import { Component, booleanAttribute, input } from '@angular/core';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.html',
  styleUrl: './page-loader.css',
  host: { class: /* tw */ 'contents' },
})
export class PageLoader {
  readonly active = input(false, { transform: booleanAttribute });
}
