import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { statsResolver } from './stats-resolver';

describe('statsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => statsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
