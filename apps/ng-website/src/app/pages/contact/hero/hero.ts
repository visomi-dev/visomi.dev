import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',

  host: {
    class: /* tw */ 'flex h-full flex-col justify-between -mt-20 space-y-12 md:col-span-4',
  },
})
export class Hero {}
