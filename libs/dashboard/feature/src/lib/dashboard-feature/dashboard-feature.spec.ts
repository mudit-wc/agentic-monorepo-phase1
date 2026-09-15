import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardFeature } from './dashboard-feature';

describe('DashboardFeature', () => {
  let component: DashboardFeature;
  let fixture: ComponentFixture<DashboardFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
