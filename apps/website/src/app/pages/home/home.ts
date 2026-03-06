import { Component } from '@angular/core';

import { Navbar } from '../../shared/layout/navbar/navbar';

import { Background } from './background/background';

@Component({
  selector: 'app-home',
  imports: [Background, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
