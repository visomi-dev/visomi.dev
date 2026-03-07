import { Component } from '@angular/core';

@Component({
  selector: 'app-works',
  imports: [],
  templateUrl: './works.html',
  styleUrl: './works.css',
  host: {
    class:
      /* tw */ 'relative z-10 block bg-neutral-50 px-6 py-24 transition-colors duration-500 md:px-12 dark:bg-neutral-950',
    id: 'works',
  },
})
export class Works {}
