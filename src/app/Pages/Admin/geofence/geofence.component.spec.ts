import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeofenceComponent } from './geofence.component';

describe('GeofenceComponent', () => {
  let component: GeofenceComponent;
  let fixture: ComponentFixture<GeofenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeofenceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeofenceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
