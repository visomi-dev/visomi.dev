import { Component } from '@angular/core';

import { Navbar } from '../../shared/layout/navbar/navbar';

@Component({
  selector: 'app-journey',
  imports: [Navbar],
  templateUrl: './journey.html',
  styleUrl: './journey.css',

  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black',
  },
})
export class Journey {}
