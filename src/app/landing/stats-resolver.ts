import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

import { Stats } from './stats';

export const statsResolver: ResolveFn<Promise<void>> = async () => {
  const stats = inject(Stats);

  await Promise.all([
    stats.getCodingTime(),
    stats.getLanguages(),
    stats.getEditors(),
    stats.getOperatingSystems(),
    stats.getCategories(),
  ]);
};
