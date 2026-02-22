import { Component } from '@angular/core';

import { Background } from './background/background';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-home',
  imports: [Background, Hero],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
