import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

import { HomeService } from './home.service';

export const homeResolver: ResolveFn<Promise<void>> = async () => {
  console.log('Fetching home data...');

  const homeService = inject(HomeService);

  await Promise.all([
    homeService.getCodingTime(),
    homeService.getLanguagesStats(),
    homeService.getEditorsStats(),
    homeService.getOperatingSystemsStats(),
    homeService.getCategoriesStats(),
  ]);
};
