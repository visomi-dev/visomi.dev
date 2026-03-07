import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageNavigationLoader } from './shared/layout/page-navigation-loader/page-navigation-loader';
import { Navbar } from './shared/layout/navbar/navbar';

@Component({
  imports: [RouterOutlet, PageNavigationLoader, Navbar],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: /* tw */ 'block min-h-full w-full',
  },
})
export class App {}
