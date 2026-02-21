import { Component } from '@angular/core';

import { Background } from './background/background';

@Component({
  selector: 'app-home',
  imports: [Background],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
