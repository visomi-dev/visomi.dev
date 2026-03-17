import { TestBed } from '@angular/core/testing';

import { UI } from './ui';

describe('UI', () => {
  let service: UI;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UI);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
