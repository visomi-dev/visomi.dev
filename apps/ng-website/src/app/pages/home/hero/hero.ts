import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  host: {
    class: /* tw */ 'relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center',
  },
})
export class Hero {}
