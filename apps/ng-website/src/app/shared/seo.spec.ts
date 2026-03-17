import { TestBed } from '@angular/core/testing';

import { SEO } from './seo';

describe('SEO', () => {
  let service: SEO;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SEO);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
