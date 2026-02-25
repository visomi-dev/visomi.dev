import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageNavigationLoader } from './shared/page-navigation-loader/page-navigation-loader';
import { LanguageSwitcher } from './shared/language-switcher/language-switcher';

@Component({
  imports: [RouterOutlet, PageNavigationLoader, LanguageSwitcher],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: /* tw */ 'block min-h-full w-full',
  },
})
export class App {}
