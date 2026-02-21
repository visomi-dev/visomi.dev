import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageNavigationLoader } from './shared/page-navigation-loader/page-navigation-loader';

@Component({
  imports: [RouterOutlet, PageNavigationLoader],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: /* tw */ 'block min-h-full w-full',
  },
})
export class App {}
