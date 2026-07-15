import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleAssignmentsComponent } from './vehicle-assignments.component';

describe('VehicleAssignmentsComponent', () => {
  let component: VehicleAssignmentsComponent;
  let fixture: ComponentFixture<VehicleAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleAssignmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleAssignmentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
