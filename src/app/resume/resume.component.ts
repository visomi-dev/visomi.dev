import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css',
})
export default class ResumeComponent {
  @HostBinding('class') readonly class =
    /* tw */ 'flex flex-col fixed top-0 w-full';
}
