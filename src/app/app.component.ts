import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageLoaderComponent } from './shared/ui/page-loader/page-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block min-h-full w-full';
}
