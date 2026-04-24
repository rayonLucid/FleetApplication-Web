import { Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
@Injectable({
  providedIn: 'root'
})
export class TrackingService {
public isTracking = false;
  public totalDistance = 0; // in km
  private path: L.LatLng[] = [];
constructor() { }

// Signals for real-time UI updates
  public tripStatus = signal<'Idle'|'At Origin' | 'In Transit' | 'Arrived'>('At Origin');

processMovement(currentPos: L.LatLng, origin: L.Circle, destination: L.Circle) {
    const distToOrigin = currentPos.distanceTo(origin.getLatLng());
    const distToDest = currentPos.distanceTo(destination.getLatLng());
// 1. Get the last recorded position from our path history
  const lastPos = this.path.length > 0 ? this.path[this.path.length - 1] : null;

if (lastPos) {
   const distanceMoved = lastPos ? lastPos.distanceTo(currentPos) : 0;
// Only count movement if the distance moved is greater than 5 meters
// This prevents 'Total Distance' from creeping up while the car is stuck in traffic
if (distanceMoved > 5) {
  this.totalDistance += distanceMoved / 1000;
  this.path.push(currentPos);
}
}else {
    // If this is the very first point of the trip
    this.path.push(currentPos);
  }

  // 3. Continue with Geofence status checks...
  // const distToOrigin = currentPos.distanceTo(origin.getLatLng());
  // const distToDest = currentPos.distanceTo(destination.getLatLng());
    // 1. Initial State: At Origin
    if (this.tripStatus() === 'Idle' || this.tripStatus() === 'At Origin') {
      if (distToOrigin <= origin.getRadius()) {
        this.tripStatus.set('At Origin');
      } else {
        this.tripStatus.set('In Transit');
        this.path = [currentPos]; // Start recording path
      }
    }

    // 2. Transit State: Calculate Distance
    if (this.tripStatus() === 'In Transit') {
      const lastPoint = this.path[this.path.length - 1];
      this.totalDistance += lastPoint.distanceTo(currentPos) / 1000;
      this.path.push(currentPos);

      // 3. Check for Arrival
      if (distToDest <= destination.getRadius()) {
        this.tripStatus.set('Arrived');
      }
    }

  }


checkDualGeofence(currentPos: L.LatLng, origin: L.Circle, destination: L.Circle) {
    const distToOrigin = currentPos.distanceTo(origin.getLatLng());
    const distToDest = currentPos.distanceTo(destination.getLatLng());

    // 1. Check if we left the start location
    if (this.tripStatus() === 'At Origin' && distToOrigin > origin.getRadius()) {
      this.tripStatus.set('In Transit');
      console.log("Vehicle has left the Origin fence!");
    }

    // 2. Check if we entered the destination
    if (this.tripStatus() === 'In Transit' && distToDest <= destination.getRadius()) {
      this.tripStatus.set('Arrived');
      console.log("Vehicle has reached the Destination!");
    }
  }


startTrip(startCoord: L.LatLng) {
    this.isTracking = true;
    this.totalDistance = 0;
    this.path = [startCoord];
    this.tripStatus.set('At Origin');
  }

  updateLocation(newCoord: L.LatLng): number {
    if (!this.isTracking) return 0;

    const lastPoint = this.path[this.path.length - 1];
    // .distanceTo returns meters, we divide by 1000 for KM
    const distanceMeters = lastPoint.distanceTo(newCoord);

    this.totalDistance += (distanceMeters / 1000);
    this.path.push(newCoord);

    return this.totalDistance;
  }

  endTrip() {
    this.isTracking = false;

  }

  public geofenceStatus = signal<'Inside' | 'Outside'>('Inside');

  checkGeofence(currentCoord: L.LatLng, fenceCenter: L.LatLng, radiusMeters: number) {
    const distance = currentCoord.distanceTo(fenceCenter);

    if (distance > radiusMeters) {
      this.geofenceStatus.set('Outside');
      return false; // Vehicle has exited
    } else {
      this.geofenceStatus.set('Inside');
      return true; // Vehicle is safe
    }
  }
}
