import { Component, computed, HostBinding, inject } from '@angular/core';

import { UI } from '../../../shared/ui';

@Component({
  selector: 'app-personal-info',
  imports: [],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class PersonalInfo {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  private readonly uiService = inject(UI);

  readonly age = computed(() => {
    const dateTime = this.uiService.$DateTime();

    if (dateTime == null) {
      return null;
    }

    return Math.floor(
      Math.abs(
        dateTime.fromFormat('1995-05-20', 'yyyy-MM-dd').diffNow('years').years,
      ),
    );
  });

  readonly experience = computed(() => {
    const dateTime = this.uiService.$DateTime();

    if (dateTime == null) {
      return null;
    }

    return Math.floor(
      Math.abs(
        dateTime.fromFormat('2016-06-01', 'yyyy-MM-dd').diffNow('years').years,
      ),
    );
  });
}
