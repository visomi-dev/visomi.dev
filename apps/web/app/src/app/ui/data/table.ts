import { Directive } from '@angular/core';

import { table as styles } from '@visomi-stack/web-frontend-ui/lib/data';

@Directive({
  selector: 'table[appUI]',
  host: { '[class]': 'classes' },
})
export class Table {
  protected readonly classes = styles.classes();
}
