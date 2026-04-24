// services/location.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TrackPoint } from '../Data/data-interface';



@Injectable({ providedIn: 'root' })
export class LocationService {
  private watchId: number | null = null;
  private locationSubject = new Subject<TrackPoint>();

  startTracking(): Observable<TrackPoint> {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleLocationUpdate(position),
        (error) => this.handleLocationError(error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
    return this.locationSubject.asObservable();
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private handleLocationUpdate(position: GeolocationPosition): void {
    const location: TrackPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: new Date(),
      speed: position.coords.speed,
      heading: position.coords.heading,
      accuracy: position.coords.accuracy
    };
    this.locationSubject.next(location);
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Location error:', error.message);
  }
}
