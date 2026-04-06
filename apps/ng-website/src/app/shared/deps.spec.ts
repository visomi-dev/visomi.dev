import { TestBed } from '@angular/core/testing';

import { Deps } from './deps';

describe('Deps', () => {
  let service: Deps;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Deps);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
