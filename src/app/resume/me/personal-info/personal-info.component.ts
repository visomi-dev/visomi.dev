import { Component, HostBinding } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css',
})
export class PersonalInfoComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  readonly age = Math.floor(
    Math.abs(
      DateTime.fromFormat('1995-05-20', 'yyyy-MM-dd').diffNow('years').years,
    ),
  );

  readonly experience = Math.floor(
    Math.abs(
      DateTime.fromFormat('2016-06-01', 'yyyy-MM-dd').diffNow('years').years,
    ),
  );
}
