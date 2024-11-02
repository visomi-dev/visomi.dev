import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechPreferencesComponent } from './tech-preferences.component';

describe('TechPreferencesComponent', () => {
  let component: TechPreferencesComponent;
  let fixture: ComponentFixture<TechPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechPreferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
