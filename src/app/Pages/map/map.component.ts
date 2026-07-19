import { MapService } from './../../../Services/map.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit,AfterViewInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { TrackingService } from '../../../Services/Tracking.service';
import { FormsModule } from '@angular/forms';
import { RealTimeTrackingService } from '../../../Services/RealTimeTracking.service';
import { TelemetryService } from '../../../Services/Telemetry.service';
import {  GpsData, GpsUpdate, RecentTrip } from '../../../Data/data-interface';
import {  SignalRService } from '../../../Services/signalr.service';
import { Subscription } from 'rxjs';
import { DriverService } from '../../../Services/driver.service';
import { ToastrService } from 'ngx-toastr';
import { GeofenceService } from '../../../Services/geofence.service';

@Component({
  selector: 'app-map',
  standalone: true, // 2. Ensure this is true
  imports: [LeafletModule,CommonModule,FormsModule], // 3. Add to imports array
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit,OnDestroy ,AfterViewInit{
   private subscription!: Subscription;
  private isMapReady = false;

   markers = new Map<string, L.Marker>();



ShowTrackerBoard = true;
  carMarker: L.Marker | null =null ;
  routeLine: L.Polyline | null = null;
    map!: L.Map;
searchQuery: string = '';
    originCircle?: L.Circle;
  destCircle?: L.Circle;
 // UI State
  settingMode: 'START' | 'DESTINATION' | 'NONE' = 'NONE';

  // 1. Define the base map options
  options: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© Rayon Solutions 2026',


      })
    ],
    zoom: 13,
    center: L.latLng(6.5244, 3.3792) // Lagos, Nigeria coordinates
  };


  // Define our fence parameters
  fenceCenter = L.latLng(6.5244, 3.3792);
  fenceRadius = 1000; // 1km radius
  geofenceCircle!: L.Circle;

  // Geofence Objects

  destinationCircle?: L.Circle;
  icon: L.Icon<L.IconOptions> = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

driverService =inject(DriverService)
  currentTrip:RecentTrip[] =[] ;
  selectedTrip!: RecentTrip;
driverData :GpsUpdate |null =null

tracker = inject(TrackingService);
mapservice =inject(MapService)
geofenceService =inject(GeofenceService)
cdRef=inject(ChangeDetectorRef);
telemetryService = inject(TelemetryService);
toast =inject(ToastrService)
private signalRService: SignalRService=inject(SignalRService)
  geofenceLayerGroup: any;
  destinationMarker: L.Marker | null =null;
  geoFenceMarker : L.Marker | null =null;
  geoFenceMarkerLayerGroup!: L.LayerGroup;

constructor() {
//  this.geofenceLayerGroup = L.layerGroup().addTo(this.map);
//this.geoFenceMarkerLayerGroup = L.layerGroup().addTo(this.map);
    // This effect runs automatically whenever the tracker.lastKnownLocation() changes
    effect(() => {
      this.signalRService.onGpsUpdateReceived((data:GpsUpdate) => {

    this.driverData =data
    this.cdRef.markForCheck()

if (this.geofenceCircle) this.map.removeLayer(this.geofenceCircle);
  if (this.destinationCircle) this.map.removeLayer(this.destinationCircle);
  if (this.carMarker) { this.map.removeLayer(this.carMarker); this.carMarker = null; }
  if (this.routeLine) { this.map.removeLayer(this.routeLine); this.routeLine = null; }

      // Check if the moving vehicle matches the trip the dispatcher is currently watching
      if (this.selectedTrip && this.selectedTrip.vehicleId === data.vehicleId) {
        const currentPos = L.latLng(data.latitude, data.longitude);

        // 1. Update Map UI (Marker and Path)
        if (!this.carMarker) {
          this.carMarker = L.marker(currentPos, { icon: this.icon }).addTo(this.map);
          this.routeLine = L.polyline([currentPos], { color: '#3498db' }).addTo(this.map);
        }
 this.geofenceCircle = L.circle(currentPos, {
    radius:  500,
    color: '#31dc79',
    fillColor: '#2ecc71',
    fillOpacity: 0.2
  }).addTo(this.map);

        // 2. Center map on the real vehicle movement
        this.map.panTo(currentPos);

        // // 3. Process Geofencing math locally using the live driver coordinates
        // if (this.geofenceCircle && this.destinationCircle) {
        //   this.tracker.processMovement(currentPos, this.geofenceCircle, this.destinationCircle);
        // }

        // // 4. Handle arrival logic
        // if (this.tracker.tripStatus() === 'Arrived') {
        //   alert(`${this.selectedTrip.driverName} has arrived at the destination!`);
        //   // Handle any cleanup needed
        // }
      }
    });
    });
  }
  ngOnInit(): void {
   // this.startRealTracking();
  // this.useCurrentLocationAsStart()
  this.StartConnection()
  this.loadCurrentTrip()


  }

  ngAfterViewInit(): void {
  this.geofenceLayerGroup = L.layerGroup().addTo(this.map);
  this.geoFenceMarkerLayerGroup = L.layerGroup().addTo(this.map);
}
  ListenforLocationChange() {
   this.signalRService.onGpsUpdateReceived((data:GpsUpdate) => {
    console.log(data)
    this.driverData =data
console.log(data)
if (this.geofenceCircle) this.map.removeLayer(this.geofenceCircle);
  if (this.destinationCircle) this.map.removeLayer(this.destinationCircle);
  if (this.carMarker) { this.map.removeLayer(this.carMarker); this.carMarker = null; }
  if (this.routeLine) { this.map.removeLayer(this.routeLine); this.routeLine = null; }

      // Check if the moving vehicle matches the trip the dispatcher is currently watching
      if (this.selectedTrip && this.selectedTrip.vehicleId === data.vehicleId) {
        const currentPos = L.latLng(data.latitude, data.longitude);

        // 1. Update Map UI (Marker and Path)
        if (!this.carMarker) {
          this.carMarker = L.marker(currentPos, { icon: this.icon }).addTo(this.map);
          this.routeLine = L.polyline([currentPos], { color: '#3498db' }).addTo(this.map);
        }
 this.geofenceCircle = L.circle(currentPos, {
    radius:  500,
    color: '#31dc79',
    fillColor: '#2ecc71',
    fillOpacity: 0.2
  }).addTo(this.map);

        // 2. Center map on the real vehicle movement
        this.map.panTo(currentPos);

        // // 3. Process Geofencing math locally using the live driver coordinates
        // if (this.geofenceCircle && this.destinationCircle) {
        //   this.tracker.processMovement(currentPos, this.geofenceCircle, this.destinationCircle);
        // }

        // // 4. Handle arrival logic
        // if (this.tracker.tripStatus() === 'Arrived') {
        //   alert(`${this.selectedTrip.driverName} has arrived at the destination!`);
        //   // Handle any cleanup needed
        // }
      }
    });
  }
  StartConnection() {
     this.signalRService.start()

 //this.ListenforLocationChange();

  }

 private updateOrAddMarker(update: GpsUpdate): void {
    const latlng = L.latLng(update.latitude, update.longitude);
    const popupContent = `
      <b>IMEI:</b> ${update.vehicleId}<br>
      <b>Speed:</b> ${update.speed} km/h<br>
      <b>Time:</b> ${new Date(update.timestamp).toLocaleTimeString()}
    `;

    if (this.markers.has(update.vehicleId)) {
      // Update existing marker
      const marker = this.markers.get(update.vehicleId);
      marker?.setLatLng(latlng);
      marker?.setPopupContent(popupContent);
    } else {
      // Add new marker
      const marker = L.marker(latlng).addTo(this.map).bindPopup(popupContent);
      this.markers.set(update.vehicleId, marker);
    }

    // Center map on the latest vehicle (optional)
    this.map.setView(latlng, 12);
  }
updateMapMarker(pos: L.LatLng) {
    if (!this.carMarker) {
      this.carMarker = L.marker(pos).addTo(this.map);
      this.routeLine = L.polyline([pos], { color: '#3498db' }).addTo(this.map);
    } else {
      this.carMarker.setLatLng(pos);
      this.routeLine?.addLatLng(pos);
    }
    this.map.panTo(pos);
  }


  // When the user selects a car to track
  // trackHardwareDevice(deviceId: string) {
  //   this.rtTracking.startConnection(deviceId);
  // }
  // 2. We will store a reference to the map object for later
handleMapClick(latlng: L.LatLng) {

  if (this.settingMode === 'START') {
      if (this.originCircle) this.map.removeLayer(this.originCircle);
      //this.originCircle = L.circle(latlng, { radius: 800, color: 'green', fillColor: '#2ecc71', fillOpacity: 0.3 }).addTo(this.map);
      this.settingMode = 'NONE';
       this.geofenceCircle.setLatLng(latlng); // Move geofence to new origin
        this.carMarker!.setLatLng(latlng); // Move car marker to new origin
    //  console.log("Origin:", this.originCircle.getLatLng());

    }
    else if (this.settingMode === 'DESTINATION') {
      if (this.destinationCircle) this.map.removeLayer(this.destinationCircle);
      this.destinationCircle = L.circle(latlng, { radius: 0, color: 'red', fillColor: '#e74c3c', fillOpacity: 0.3 }).addTo(this.map);
      this.settingMode = 'NONE';
      console.log("Destination:", this.destinationCircle.getLatLng());
    }

    // Auto-zoom to show both if they exist
    if (this.geofenceCircle && this.destinationCircle) {
      const group = new L.FeatureGroup([this.geofenceCircle, this.destinationCircle]);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

reportLocation(lat: number, lng: number) {
    const payload: GpsData = {
      imei: 'VEHICLE-001',
      lat: lat,
      lng: lng,
      speed: 45 ,// Example speed
      timestamp: Date.now()
    };

    this.telemetryService.sendLocationUpdate(payload).subscribe({
      next: (response) => console.log('Server received telemetry:', response),
      error: (err) => console.error('Telemetry failed:', err)
    });
  }

  onMapReady(map: L.Map) {
    this.map = map;
    // Allow user to click to set locations
   this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.handleMapClick(e.latlng);
    });

    // This force-triggers a recalculation of the tile positions
  setTimeout(() => {
    this.map.invalidateSize();
  }, 100);
    this.initMarker();
  //  console.log('Map is ready and center is:', map.getCenter());
  }
setOrigin(latlng: L.LatLng) {
    if (this.geofenceCircle) this.map.removeLayer(this.geofenceCircle);
    this.geofenceCircle = L.circle(latlng, { radius: 10, color: 'green' }).addTo(this.map);
     if (this.carMarker) this.map.removeLayer(this.carMarker);
        this.carMarker = L.marker(latlng, { icon: this.icon }).addTo(this.map);
    this.settingMode = 'NONE';
  }

  setDestination(latlng: L.LatLng) {
    if (this.destCircle) this.map.removeLayer(this.destCircle);
    this.destCircle = L.circle(latlng, { radius: 10, color: 'red' }).addTo(this.map);
    this.settingMode = 'NONE';
  //  this.startRealTracking()
  }
   iconRetinaUrl = 'assets/marker-icon-2x.png';
 iconUrl = 'assets/marker-icon.png';
 shadowUrl = 'assets/marker-shadow.png';
 iconDefault = L.icon({
  iconRetinaUrl: this.iconRetinaUrl,
  iconUrl: this.iconUrl,
  shadowUrl: this.shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
//L.Marker.prototype.options.icon = this.iconDefault;

 initMarker() {

    this.carMarker = L.marker([6.5244, 3.3792], { icon: this.icon }).addTo(this.map);
    this.routeLine = L.polyline([], { color: 'blue' }).addTo(this.map);

    this.geofenceCircle = L.circle(this.fenceCenter, {
      radius: this.fenceRadius,
      color: 'green',
      fillColor: '#2ecc71',
      fillOpacity: 0.2
    }).addTo(this.map);
  }
totalDistance: number = 0;
isTracking: boolean = false;

startTrip() {
  this.isTracking = true;
  this.totalDistance = 0;

  // Create a marker at the map center to start
  const center = this.map.getCenter();
  this.carMarker = L.marker(center).addTo(this.map);

  alert("Trip Started!");
}

endTrip() {
  this.isTracking = false;
 // alert(`Trip Ended. Total distance: ${this.totalDistance.toFixed(2)} km`);

  this.tracker.endTrip();

  // Fit the map to the entire path taken so the user can see the whole trip
  if (this.routeLine!.getLatLngs().length > 0) {
    this.map.fitBounds(this.routeLine!.getBounds(), { padding: [20, 20] });
  }

  alert(`Trip Summary:
  Total Distance: ${this.tracker.totalDistance.toFixed(2)} km
  Status: Completed`);
}

beginTrip() {
    this.tracker.startTrip(this.carMarker!.getLatLng());
  }
autoSimulate() {
  setInterval(() => {
    if (this.tracker.isTracking) {
      this.simulateMove();
    }
  }, 3000); // Moves every 3 seconds
}
  simulateMove() {
    if (!this.tracker.isTracking) return;

    const current = this.carMarker!.getLatLng();
    // Simulate moving North-East slightly
    const next = L.latLng(current.lat + 0.002, current.lng + 0.002);

    this.carMarker!.setLatLng(next);
    this.routeLine!.addLatLng(next);
    this.tracker.updateLocation(next);
    this.map.panTo(next);


    // Check Geofence
    const isInside = this.tracker.checkGeofence(next, this.fenceCenter, this.fenceRadius);

    // Change fence color if car exits
    if (!isInside) {
      this.geofenceCircle.setStyle({ color: 'red', fillColor: '#e74c3c' });
    } else {
      this.geofenceCircle.setStyle({ color: 'green', fillColor: '#2ecc71' });
    }

    this.map.panTo(next);
  }


  startSimulation() {
  if (!this.geofenceCircle || !this.destinationCircle) {
    alert("Please set both Start and Destination first!");
    return;
  }
  this.ShowTrackerBoard = false;


  const start = this.geofenceCircle.getLatLng();
  const end = this.destinationCircle.getLatLng();

  // Create or reset marker/line
  if (this.carMarker) this.map.removeLayer(this.carMarker);
  if (this.routeLine) this.map.removeLayer(this.routeLine);

 // this.carMarker = L.marker(start).addTo(this.map);
      this.carMarker = L.marker(start, { icon: this.icon }).addTo(this.map);
  this.routeLine = L.polyline([start], { color: '#3498db' }).addTo(this.map);

this.carMarker.bindTooltip("Vehicle: XYZ-123", {
  permanent: false, // Only show on hover (set to true to keep it visible)
  direction: 'top', // Position relative to the marker
  offset: [0, -32]  // Adjust so it doesn't cover the icon
});

  let steps = 0;
  const totalSteps = 1000; // How smooth the movement is

  const tripBounds = L.latLngBounds([start, end]);
this.map.fitBounds(tripBounds, { padding: [50, 50] });

  const interval = setInterval(() => {
    steps++;
    const progress = steps / totalSteps;

    // Calculate intermediate point
    const nextLat = start.lat + (end.lat - start.lat) * progress;
    const nextLng = start.lng + (end.lng - start.lng) * progress;
    const nextPos = L.latLng(nextLat, nextLng);

    // Update UI
    this.carMarker?.setLatLng(nextPos);
    this.routeLine?.addLatLng(nextPos);

    // Process Geofencing math
    this.tracker.processMovement(nextPos, this.geofenceCircle!, this.destinationCircle!);

// 🌟 STREAM TO C# HERE: Send the simulated position to your backend
    this.signalRService.sendGpsUpdate("XYZ-123", nextLat, nextLng,  this.tracker.totalDistance)
      .catch(err => console.error("Failed to stream update:", err));

    if (steps >= totalSteps || this.tracker.tripStatus() === 'Arrived') {
      clearInterval(interval);
         this.ShowTrackerBoard = true;
   // this.destinationCircle = undefined;

     this.totalDistance = 0;
    //  console.log("Simulation Finished");
      this.cdRef.detectChanges(); // Ensure UI updates after simulation ends
    }
  }, 100); // Moves every 100ms
}

// ... inside your MapComponent class

useCurrentLocationAsStart() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const currentLatLng = L.latLng(lat, lng);

      // 1. Center the map on the user
      this.map.setView(currentLatLng, 15);

      // 2. Set the Origin Geofence at this location
      if (this.geofenceCircle) this.map.removeLayer(this.geofenceCircle);

      this.geofenceCircle = L.circle(currentLatLng, {
        radius: 10,
        color: 'green',
        fillColor: '#2ecc71',
        fillOpacity: 0.3
      }).addTo(this.map);

      // 3. Place a marker to show where the user is
      if (this.carMarker) this.map.removeLayer(this.carMarker);
      this.carMarker = L.marker(currentLatLng, { icon: this.icon }).addTo(this.map);

      // Add a tooltip that appears on hover
this.carMarker.bindTooltip("Vehicle: XYZ-123", {
  permanent: false, // Only show on hover (set to true to keep it visible)
  direction: 'top', // Position relative to the marker
  offset: [0, -32]  // Adjust so it doesn't cover the icon
});

      console.log(`Location found: ${lat}, ${lng}`);
      if(this.destinationCircle) {
        const group = new L.FeatureGroup([this.geofenceCircle, this.destinationCircle]);
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
       // this.startRealTracking();
      }
    },
    (error) => {
      alert("Error getting location: " + error.message);
      console.warn(`Geolocation error (${error.code}): ${error.message}`);

        // 🌟 CRITICAL FALLBACK: If timeout expires, use default coordinates
        // Using standard Lagos coordinates as a reliable starting anchor
        const defaultLat = 6.5244;
        const defaultLng = 3.3792;

        console.log("Using fallback coordinates due to browser timeout.");
     //   this.setupMap(defaultLat, defaultLng);
    },
    { enableHighAccuracy: true } // Uses GPS if available for better precision
  );
}
searchQueryPup:string = '';
async searchLocation() {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${this.searchQueryPup}&viewbox=3.0,6.3,3.7,6.8&bounded=1`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.length > 0) {
    const { lat, lon } = data[0];
    const target = L.latLng(lat, lon);

    // Automatically set the destination geofence here
    this.setOrigin(target);
    this.map.flyTo(target, 14);
     this.searchQueryPup = data[0].display_name;
  } else {
    alert("Location not found");
  }
}

async performSearch() {
    if (!this.searchQuery) return;

    try {
      // Nominatim API call (limited to Lagos/Nigeria for better accuracy)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&viewbox=3.0,6.3,3.7,6.8&bounded=1`;

      const response = await fetch(url);
      const results = await response.json();

      if (results.length > 0) {
        const topResult = results[0];
        const latlng = L.latLng(parseFloat(topResult.lat), parseFloat(topResult.lon));

        // 1. Move the map to the found location
        this.map.flyTo(latlng, 15);

        // 2. Automatically set this as the Destination
        if (this.destinationCircle) this.map.removeLayer(this.destinationCircle);

        this.destinationCircle = L.circle(latlng, {
          radius: 100,
          color: 'red',
          fillColor: '#e74c3c',
          fillOpacity: 0.3
        }).addTo(this.map);

        this.searchQuery = topResult.display_name; // Update input with full address
        this.cdRef.detectChanges(); // Update UI with new search query

        // If we already have an origin, start tracking
        if (this.geofenceCircle) {
          const group = new L.FeatureGroup([this.geofenceCircle, this.destinationCircle]);
          this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
         // this.startRealTracking();
        }
      } else {
        alert("Location not found in this area.");
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  }
private watchId?: number;

startRealTracking1() {


  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  if (!this.geofenceCircle || !this.destinationCircle) {
    alert("Please set your geofences first!");
    return;
  }


  // Start watching the device's GPS
  this.watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const currentPos = L.latLng(latitude, longitude);

      // 1. Update UI (Marker and Path)
      if (!this.carMarker) {
        this.carMarker = L.marker(currentPos,{icon:this.icon}).addTo(this.map);
        this.routeLine = L.polyline([currentPos], { color: '#3498db' }).addTo(this.map);
      } else {
        this.carMarker.setLatLng(currentPos);
        this.routeLine?.addLatLng(currentPos);
      }

      // 2. Center map on movement
      this.map.panTo(currentPos);

      // 3. Run your Geofencing/Distance logic
      this.tracker.processMovement(currentPos, this.geofenceCircle!, this.destinationCircle!);
      this.signalRService.sendGpsUpdate(this.currentTrip[0].vehiclePlate, latitude, longitude,  this.tracker.totalDistance)
      console.log(`Moving: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`);

      // Stop watching if we've arrived
      if (this.tracker.tripStatus() === 'Arrived') {
        this.stopTracking();
      }
    },
    (error) => console.error(error),
    {
      enableHighAccuracy: true, // Force GPS usage
      maximumAge: 0,            // Don't use cached locations
      timeout: 5000             // Wait 5s for a fix
    }
  );
}


// 1. Change the function signature to accept the specific trip
selectVehicle(selectedTrip: RecentTrip): void {
  // 1. Save this trip so the SignalR listener knows which vehicle to filter for
  this.selectedTrip = selectedTrip;
   console.log(selectedTrip)
  if (this.selectedTrip && this.selectedTrip.vehicleId === this.driverData?.vehicleId) {
    // Clear existing map layers
    if (this.geofenceLayerGroup) {
      this.map.removeLayer(this.geofenceLayerGroup);
    }
    if (this.destinationCircle) {
      this.map.removeLayer(this.destinationCircle);
      this.destinationCircle = undefined;
    }
    if (this.carMarker) {
      this.map.removeLayer(this.carMarker);
      this.carMarker = null;
    }
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }
if (this.destinationMarker) {
  this.map.removeLayer(this.destinationMarker);
}

    const startLatLng = L.latLng(this.driverData?.latitude!, this.driverData?.longitude!);
 // Now add the driver's start marker and route line
        if (!this.carMarker) {
          this.carMarker = L.marker(startLatLng, { icon: this.icon })
          .bindTooltip(`<b>Vehichle:</b><br>${this.selectedTrip?.driverName}`)
          .addTo(this.map);
          this.routeLine = L.polyline([startLatLng], { color: '#3498db' }).addTo(this.map);
        }
console.log(selectedTrip,"selected Trip")
    // -------- Fetch geofences for this vehicle --------
    this.geofenceService.getGeofencesByVehicle(selectedTrip.vehicleId).subscribe({
      next: (geofences) => {
        // console.log(geofences)
        // Create a layer group for all geofence circles
        this.geofenceLayerGroup = L.layerGroup().addTo(this.map);
            if (geofences && geofences.length > 0) {

let count =1
          geofences.forEach(gf => {
            const center = L.latLng(gf.centerLatitude, gf.centerLongitude);
//console.log(center)
            const circle = L.circle(center, {
              radius: gf.radiusMeters,
              color: '#31dc79',
              fillColor: '#050f09',
              fillOpacity: 0.5,
              weight: 2
            }).bindTooltip(`${gf.name} <br/> ${gf.address} `);
            this.geofenceLayerGroup.addLayer(circle);

 //console.log(geofences)

             this.geoFenceMarker = L.marker(center,{ icon: this.mapservice.DeliveryIcon })
  .bindTooltip(`<b>Destination ${count++}:</b><br>${gf.name}`)
  .addTo(this.map);

  // Add the marker to the dedicated LayerGroup instead of a single variable
    this.geoFenceMarkerLayerGroup.addLayer(this.geoFenceMarker);
          });


        } else {
          // No geofences assigned – show a lightweight toast
          this.toast.info('No geofences assigned to this vehicle.');
        }

        // Handle destination circle if available
        if (selectedTrip.destinationLat) {

          const destLatLng = L.latLng(selectedTrip.destinationLat, selectedTrip.destinationLng);
          this.destinationCircle = L.circle(destLatLng, {
            radius: selectedTrip.destinationRadius || 500,
            color: '#0e0a0a',
            fillColor: '#0b0606',
            fillOpacity: 0.5
          }).bindTooltip(`${selectedTrip.endLocation}`)
          .addTo(this.map);

          // 2. Add the pointer (marker) right in the center
this.destinationMarker = L.marker(destLatLng,{ icon: this.mapservice.DestIcon })
  .bindTooltip(`<b>Destination:</b><br>${selectedTrip.endLocation}`)
  .addTo(this.map);

          // Fit bounds to show both start and destination
          const group = L.featureGroup([this.geofenceLayerGroup, this.destinationCircle]);
          this.map.fitBounds(group.getBounds().pad(0.1));
        } else {
          // No destination, just center on start
          this.map.setView(startLatLng, 14);
        }

        // Center map on start location (pan to it)
        this.map.panTo(startLatLng);
      },
      error: (err) => {
        console.error('Failed to load geofences:', err);
        this.toast.error(err,'Could not load geofences for this vehicle.');
      }
    });
  } else {
    this.toast.error('Driver data was not found');
  }
}

 ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.signalRService.stopConnection();
    if (this.map) {
      this.map.remove();
    }
  }

stopTracking() {
  if (this.watchId !== undefined) {
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = undefined;
    alert("Tracking Stopped.");
  }
}

 async loadCurrentTrip(){
   try {
      const [trip] = await Promise.all([

        this.driverService.ActiveTrips().toPromise()
      ]);
    //  console.log(stats)

      this.currentTrip = trip?.filter(x =>x.status !="Completed" && x.status !="Loading") ?? [];
     console.log( this.currentTrip)
      this.cdRef.detectChanges()
    } catch (err) {
      console.error(err,"Error");
     // this.errorMessage = 'Failed to load dashboard data. Please refresh.';
    } finally {
     // this.isLoading = false;
      this.cdRef.detectChanges()
    }
}
}
