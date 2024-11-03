import { Component, computed, HostBinding, inject } from '@angular/core';

import { UIService } from '../../../shared/ui/ui.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css',
})
export class PersonalInfoComponent {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  private readonly uiService = inject(UIService);

  readonly age = computed(() => {
    const DateTime = this.uiService.$DateTime();

    if (DateTime == null) {
      return null;
    }

    return Math.floor(
      Math.abs(
        DateTime.fromFormat('1995-05-20', 'yyyy-MM-dd').diffNow('years').years,
      ),
    );
  });

  readonly experience = computed(() => {
    const DateTime = this.uiService.$DateTime();

    if (DateTime == null) {
      return null;
    }

    return Math.floor(
      Math.abs(
        DateTime.fromFormat('2016-06-01', 'yyyy-MM-dd').diffNow('years').years,
      ),
    );
  });
}
