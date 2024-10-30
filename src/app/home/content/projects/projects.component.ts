import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  @HostBinding('class') readonly class = /* tw */ 'flex flex-col w-full';
}
