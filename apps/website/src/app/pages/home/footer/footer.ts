import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  host: {
    class:
      /* tw */ 'relative z-10 block border-t border-border-light bg-neutral-50 px-6 py-12 transition-colors duration-500 dark:border-border-dark dark:bg-neutral-950',
  },
})
export class Footer {}
