import { Component } from '@angular/core';

import { Background } from './background/background';
import { NavItem, TubelightNavbar } from './tubelight-navbar/tubelight-navbar';

@Component({
  selector: 'app-home',
  imports: [Background, TubelightNavbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  navItems: NavItem[] = [
    { name: 'Home', url: '#home', icon: 'home' },
    { name: 'About', url: '#about', icon: 'person' },
    { name: 'Projects', url: '#projects', icon: 'work' },
    { name: 'Contact', url: '#contact', icon: 'mail' },
  ];
}
