/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TrackingService } from './Tracking.service';

describe('Service: Tracking', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrackingService]
    });
  });

  it('should ...', inject([TrackingService], (service: TrackingService) => {
    expect(service).toBeTruthy();
  }));
});
