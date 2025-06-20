import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageNavigationLoader } from './shared/page-navigation-loader/page-navigation-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageNavigationLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @HostBinding('class') readonly cls = /* tw */ 'block min-h-full w-full';
}
