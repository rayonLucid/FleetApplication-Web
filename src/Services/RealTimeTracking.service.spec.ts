/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RealTimeTrackingService } from './RealTimeTracking.service';

describe('Service: RealTimeTracking', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealTimeTrackingService]
    });
  });

  it('should ...', inject([RealTimeTrackingService], (service: RealTimeTrackingService) => {
    expect(service).toBeTruthy();
  }));
});
