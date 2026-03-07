import { Component } from '@angular/core';

@Component({
  selector: 'app-journey',
  imports: [],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
  host: {
    class:
      /* tw */ 'relative z-10 block border-t border-border-light bg-white/40 px-6 py-24 backdrop-blur-sm transition-colors duration-500 md:px-12 dark:border-border-dark dark:bg-white/2',
  },
})
export class Journey {}
