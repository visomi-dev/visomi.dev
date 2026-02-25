import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TubelightNavbar } from './tubelight-navbar';

describe('TubelightNavbar', () => {
  let component: TubelightNavbar;
  let fixture: ComponentFixture<TubelightNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TubelightNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(TubelightNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
