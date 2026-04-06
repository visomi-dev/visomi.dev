import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechPreferences } from './tech-preferences';

describe('TechPreferences', () => {
  let component: TechPreferences;
  let fixture: ComponentFixture<TechPreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechPreferences],
    }).compileComponents();

    fixture = TestBed.createComponent(TechPreferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
