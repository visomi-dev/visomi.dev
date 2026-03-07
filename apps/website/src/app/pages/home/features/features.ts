import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  imports: [],
  templateUrl: './features.html',
  styleUrl: './features.css',
  host: {
    class:
      /* tw */ 'relative z-10 block border-t border-border-light bg-neutral-50 px-6 py-24 transition-colors duration-500 md:px-12 dark:border-border-dark dark:bg-neutral-950',
  },
})
export class Features {}
