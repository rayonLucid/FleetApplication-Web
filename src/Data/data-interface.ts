// models/location.model.ts
export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

// Or use a more descriptive name
export interface VehicleLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speedKmh?: number;
  headingDegrees?: number;
}
export interface LocationData {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number;
}
