import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { TrackingService } from '../../Services/Tracking.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-map',
  standalone: true, // 2. Ensure this is true
  imports: [LeafletModule,CommonModule,FormsModule], // 3. Add to imports array
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  ngOnInit(): void {
   // this.startRealTracking();
   this.useCurrentLocationAsStart()
  }
tracker = inject(TrackingService);
cdRef=inject(ChangeDetectorRef);
ShowTrackerBoard = true;
  carMarker!: L.Marker;
  routeLine!: L.Polyline;
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
        attribution: '© OpenStreetMap contributors'
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

  // 2. We will store a reference to the map object for later
handleMapClick(latlng: L.LatLng) {

  if (this.settingMode === 'START') {
      if (this.originCircle) this.map.removeLayer(this.originCircle);
      //this.originCircle = L.circle(latlng, { radius: 800, color: 'green', fillColor: '#2ecc71', fillOpacity: 0.3 }).addTo(this.map);
      this.settingMode = 'NONE';
       this.geofenceCircle.setLatLng(latlng); // Move geofence to new origin
        this.carMarker.setLatLng(latlng); // Move car marker to new origin
    //  console.log("Origin:", this.originCircle.getLatLng());

    }
    else if (this.settingMode === 'DESTINATION') {
      if (this.destinationCircle) this.map.removeLayer(this.destinationCircle);
      this.destinationCircle = L.circle(latlng, { radius: 800, color: 'red', fillColor: '#e74c3c', fillOpacity: 0.3 }).addTo(this.map);
      this.settingMode = 'NONE';
      console.log("Destination:", this.destinationCircle.getLatLng());
    }

    // Auto-zoom to show both if they exist
    if (this.geofenceCircle && this.destinationCircle) {
      const group = new L.FeatureGroup([this.geofenceCircle, this.destinationCircle]);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
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
    this.geofenceCircle = L.circle(latlng, { radius: 500, color: 'green' }).addTo(this.map);
     if (this.carMarker) this.map.removeLayer(this.carMarker);
        this.carMarker = L.marker(latlng, { icon: this.icon }).addTo(this.map);
    this.settingMode = 'NONE';
  }

  setDestination(latlng: L.LatLng) {
    if (this.destCircle) this.map.removeLayer(this.destCircle);
    this.destCircle = L.circle(latlng, { radius: 500, color: 'red' }).addTo(this.map);
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
    // Standard icon fix using CDN images to avoid local path errors
    //  this.icon = L.icon({
    //   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    //   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    //   iconSize: [25, 41],
    //   iconAnchor: [12, 41]
    // });

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
  if (this.routeLine.getLatLngs().length > 0) {
    this.map.fitBounds(this.routeLine.getBounds(), { padding: [20, 20] });
  }

  alert(`Trip Summary:
  Total Distance: ${this.tracker.totalDistance.toFixed(2)} km
  Status: Completed`);
}

beginTrip() {
    this.tracker.startTrip(this.carMarker.getLatLng());
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

    const current = this.carMarker.getLatLng();
    // Simulate moving North-East slightly
    const next = L.latLng(current.lat + 0.002, current.lng + 0.002);

    this.carMarker.setLatLng(next);
    this.routeLine.addLatLng(next);
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
//console.log("Starting Simulation...");
//console.log("Origin:", this.originCircle.getLatLng());
//console.log("Destination:", this.destinationCircle.getLatLng());

  const start = this.geofenceCircle.getLatLng();
  const end = this.destinationCircle.getLatLng();

  // Create or reset marker/line
  if (this.carMarker) this.map.removeLayer(this.carMarker);
  if (this.routeLine) this.map.removeLayer(this.routeLine);

 // this.carMarker = L.marker(start).addTo(this.map);
      this.carMarker = L.marker(start, { icon: this.icon }).addTo(this.map);
  this.routeLine = L.polyline([start], { color: '#3498db' }).addTo(this.map);

  let steps = 0;
  const totalSteps = 200; // How smooth the movement is

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
        radius: 500,
        color: 'green',
        fillColor: '#2ecc71',
        fillOpacity: 0.3
      }).addTo(this.map);

      // 3. Place a marker to show where the user is
      if (this.carMarker) this.map.removeLayer(this.carMarker);
      this.carMarker = L.marker(currentLatLng, { icon: this.icon }).addTo(this.map);

      console.log(`Location found: ${lat}, ${lng}`);
      if(this.destinationCircle) {
        const group = new L.FeatureGroup([this.geofenceCircle, this.destinationCircle]);
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
        this.startRealTracking();
      }
    },
    (error) => {
      alert("Error getting location: " + error.message);
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
          radius: 800,
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
          this.startRealTracking();
        }
      } else {
        alert("Location not found in this area.");
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  }
private watchId?: number;

startRealTracking() {


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

stopTracking() {
  if (this.watchId !== undefined) {
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = undefined;
    alert("Tracking Stopped.");
  }
}
}
