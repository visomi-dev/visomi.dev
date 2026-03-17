import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNavigationLoader } from './page-navigation-loader';

describe('PageNavigationLoader', () => {
  let component: PageNavigationLoader;
  let fixture: ComponentFixture<PageNavigationLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNavigationLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(PageNavigationLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
