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
    { name: 'Home', url: '#home', icon: 'pi pi-home' },
    { name: 'About', url: '#about', icon: 'pi pi-user' },
    { name: 'Projects', url: '#projects', icon: 'pi pi-briefcase' },
    { name: 'Contact', url: '#contact', icon: 'pi pi-envelope' },
  ];
}
