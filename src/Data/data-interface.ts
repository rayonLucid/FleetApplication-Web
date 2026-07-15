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

export interface GpsData {
  imei: string;
  lat: number;
  lng: number;
  speed: number;
  timestamp: number
}
export interface GpsUpdate {
  imei: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number;
}

export interface DriverUpdatePayload{
  id: number;                // Maps to C# int Id
  fullName: string;          // Maps to C# string FullName
  phoneNumber: string;       // Maps to C# string PhoneNumber
  licenseNumber: string;     // Maps to C# string LicenseNumber
  licenseExpiryDate: string; // Maps to C# DateTime (sent as ISO string from HTML input)
  isActive: boolean;
}
export interface DriverOnboardingPayload {
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string; // Captured as an ISO string format from HTML5 Date Pickers (YYYY-MM-DD)
}

export interface DecodedToken {
  userid: string;      // Standard User ID claim mapping
  email: string;       // Standard Email claim mapping
  companyId: string;   // 🌟 Your custom multi-tenant corporate GUID claim
  role: string;         // Token expiration timestamp (in seconds)
  iss?: string;
  aud?: string;
  exp: number;
  licenseNumber:string
}
export interface LoginCredentials { email: string; password: string; }
export interface AuthResponse { token: string; }

// src/app/interfaces/driver-dashboard.interface.ts

export interface CurrentTripInfo {
  status: 'In Transit' | 'Loading' | 'Delayed' | 'Completed';
  destination: string;
  eta: string;          // formatted time, e.g., "2:45 PM"
  deliveriesComplete: number;
  totalDeliveries: number;
  id:string
  imei:string
}

export interface DriverDashboardStats {
  assignedVehicle: string;
  driverName:string;
  licenseStatus: 'Valid' | 'Expiring Soon' | 'Expired';
  totalTripsThisMonth: number;
  activeShiftHours: number;
  fuelLevel: number;            // percentage
  dotHoursRemaining: number;
  nextMaintenanceDate: string;  // e.g., "Jul 24, 2026"
}
 export interface DailyActivityData {
  date: string;          // ISO date
  movementCount: number;
  avgSpeed: number;
}

 export interface DashboardStats {
  totalVehicles: number;
  activeDrivers: number;
  activeTrips: number;
  lowFuelAlerts: number;
  expiringLicenses: number;
  totalDistanceKm: number;
  avgFuelEfficiency: number;
}

export interface RecentTrip {
  vehicleId: any;
  id: number;
  vehiclePlate: string;
  driverName: string;
  startTime: string;
  endTime: string | null;
  distanceKm: number;
  status: string;
  imei:string;
  startLocation:string;
  endLocation:string;
  geofenceLat: number;
  geofenceLng: number;
  geofenceRadius: number;
  destinationLat: number;
  destinationLng: number;
  destinationRadius: number;
}

export interface FuelChartData {
  date: string;
  avgFuelLevel: number;
  readingsCount: number;
}

// src/app/interfaces/vehicle.interface.ts
export interface Vehicle {
  id: string;          // GUID
  plateNumber: string;
  vehicleName?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  companyId: string;
  nextMaintenanceDate?: string;
  imei?: string;
}

export interface Assignment {
  id: number;
  vehicleId: string;
  vehicleDisplay: string;
  driverId: string;
  driverName: string;
  assignedAt: string;
  unassignedAt: string | null;
  isActive: boolean;
  reason: string | null;
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehicleDisplay: string;
  driverId: string;
  driverName: string;
  startLocation?: string;
  endLocation?: string;
  startTime: string;
  endTime?: string;
  distanceKm?: number;
  status?: string;
  totalDeliveries?: number;
  deliveriesComplete?: number;
  routeId?: number;
  createdAt: string;
}

export interface OfflineGpsPing extends GpsUpdate {
  id?: number; // Auto-incremented primary key
  companyId: string;


}


export interface MapSearchResult {
  lon:number;
  lat:number;
  display_name:string;
  message:string
}


export interface Geofence {
  id: string;
  name: string;
  address:string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleName?: string;
}
