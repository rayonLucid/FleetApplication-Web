import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverTripsComponent } from './driver-trips.component';

describe('DriverTripsComponent', () => {
  let component: DriverTripsComponent;
  let fixture: ComponentFixture<DriverTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverTripsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverTripsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
