import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TubelightNavbar } from './tubelight-navbar';

describe('TubelightNavbar', () => {
  let component: TubelightNavbar;
  let fixture: ComponentFixture<TubelightNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TubelightNavbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TubelightNavbar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
