import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import * as L from 'leaflet';
import { Geofence, Vehicle } from '../../../../Data/data-interface';
import { GeofenceService } from '../../../../Services/geofence.service';
import { MapService } from '../../../../Services/map.service';
import id from '@angular/common/locales/id';
import { forkJoin } from 'rxjs';
import { VehicleService } from '../../../../Services/vehicle.service';


@Component({
  selector: 'app-geofence',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit, AfterViewInit {
  geofences: Geofence[] = [];
  filteredGeofences: Geofence[] = [];
  isLoading = false;
  searchTerm = '';
  page = 1;
  pageSize = 6;
  showInactive = false;
cdr =inject(ChangeDetectorRef)
mapService =inject(MapService)
  // Modal states
  showFormModal = false;
  isEditMode = false;
  selectedGeofenceId: string | null = null;
  formData = { name: '',address:'', centerLatitude: 0, centerLongitude: 0, radiusMeters: 500, isActive: true };
  tempCenter: { lat: number; lng: number } | null = null;

  // Assign modal
  showAssignModal = false;
  assignGeofenceId: string | null = null;
  allVehicles: Vehicle[] = [];
  assignedVehicles: Vehicle[] = [];
  selectedVehicleIds: string[] = [];
radius =0
  // Map
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private circle: L.Circle | null = null;

  constructor(private geofenceService: GeofenceService,private vehicleService:VehicleService) {}

  ngOnInit(): void {
    this.loadGeofences();
    this.loadAllVehicles();
  }

  ngAfterViewInit(): void {
   // this.initMap()
    // Map is initialized when modal opens
  }

  loadGeofences(): void {
    this.isLoading = true;
    this.geofenceService.getGeofences(this.showInactive).subscribe({
      next: (data) => {
        this.geofences = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges()
      },
      error: () => {this.isLoading = false;
          this.cdr.detectChanges()
      }
    });
  }

  loadAllVehicles(): void {
    this.vehicleService.getVehiclesToAssign().subscribe(
      data => {
      this.allVehicles = data
    //  console.log(data)
    },error =>{
      console.log(error)
    }
  );
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredGeofences = this.geofences.filter(g =>
      g.name.toLowerCase().includes(term)
    );
    this.page = 1;
  }
SerachDestination(searchQuery:string){
  // console.log(searchQuery);
this.mapService.performSearch(searchQuery).then(data => {
   // console.log(data); // This is now an array of results

    // Check if we actually got results back
    if (data  && data.message === "Success") {
      // FIX: Access the first element of the array [0]
      this.tempCenter = { lat: data.lat, lng: data.lon };

      this.updateMapOverlays();
    } else {
      // Handle "Location not found" error messages
      console.warn(data?.message || "No locations found");
    }
});
}
  toggleInactive(): void {
    this.showInactive = !this.showInactive;
    this.loadGeofences();
  }

  // ---- FORM MODAL ----
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedGeofenceId = null;
    this.formData = { name: '',address:'', centerLatitude: 0, centerLongitude: 0, radiusMeters: 500, isActive: true };
    this.tempCenter = null;
    this.showFormModal = true;
    setTimeout(() => this.initMap(), 100);
  }

  openEditModal(geofence: Geofence): void {
    console.log(geofence)
    this.isEditMode = true;
    this.selectedGeofenceId = geofence.id;
    this.formData = { ...geofence };
    this.tempCenter = { lat: geofence.centerLatitude, lng: geofence.centerLongitude };
   this. UpdateMapFromCoordinates(geofence.centerLatitude,geofence.centerLongitude)
    this.showFormModal = true;
    this.radius =geofence.radiusMeters
    setTimeout(() => this.initMap(), 1000);
   // this.updateMapOverlays()
  }
UpdateMapFromCoordinates(lat:number,lon:number){
fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
  .then(r => r.json())
  .then(data => {
   // console.log(data.display_name);
    this.formData.address =data.display_name
    this.cdr.markForCheck()
  });
}
  closeFormModal(): void {
    this.showFormModal = false;
    this.destroyMap();
  }
Issaving =false
  saveGeofence(): void {
    if (!this.formData.name) return;
    if (!this.tempCenter) return;
    const payload = {
      name: this.formData.name,
      centerLatitude: this.tempCenter.lat,
      centerLongitude: this.tempCenter.lng,
      radiusMeters: this.formData.radiusMeters,
      isActive: this.formData.isActive,
      address:this.formData.address
    };
    this.Issaving =true;
    if (this.isEditMode && this.selectedGeofenceId) {
      this.geofenceService.updateGeofence(this.selectedGeofenceId, payload).subscribe({
        next: () => {
           this.Issaving =false;
           this.loadGeofences(); this.closeFormModal(); },
        error: (err) => {
            this.Issaving =false;
            this.cdr.detectChanges()
          console.error(err)}
      });
    } else {
      this.geofenceService.createGeofence(payload).subscribe({
        next: () => { this.loadGeofences(); this.closeFormModal(); },
        error: (err) => console.error(err)
      });
    }
  }

  // ---- MAP ----
  private initMap(): void {
   // console.log(this.mapContainer)
    if (!this.mapContainer) return;
    this.destroyMap();

    const lat = this.tempCenter?.lat || 0;
    const lng = this.tempCenter?.lng || 0;
    const radius =this.radius||0
   // console.log(lng)
    this.map = L.map(this.mapContainer.nativeElement, { center: [lat, lng], zoom: 13 });
    // console.log(this.map)
    this.cdr.markForCheck()
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  this.marker = L.marker([lat, lng],{ icon:this.mapService.icon }).addTo(this.map);
   this.circle = L.circle([lat, lng], { radius, color: 'blue', fillOpacity: 0.2 }).addTo(this.map)
this.cdr.markForCheck()

    // If we have a temp center, show marker and circle

  }

  private updateMapOverlays(): void {
     console.log(this.map)
    if (!this.map || !this.tempCenter) return;

    if (this.marker) this.marker.remove();
    if (this.circle) this.circle.remove();

    this.marker = L.marker([this.tempCenter.lat, this.tempCenter.lng],{ icon:this.mapService.icon }).addTo(this.map);
    const radius = this.formData.radiusMeters || 500;
    this.circle = L.circle([this.tempCenter.lat, this.tempCenter.lng], { radius, color: 'blue', fillOpacity: 0.2 }).addTo(this.map);
    this.map.setView([this.tempCenter.lat, this.tempCenter.lng], 13);
    this.cdr.detectChanges()
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
      this.circle = null;
    }
  }

  // ---- ASSIGN MODAL ----
  openAssignModal(geofenceId: string,geoFenceName:string): void {
    this.assignGeofenceId = geofenceId;
    this.selectedVehicleIds = [];
    this.geofenceService.getVehiclesForGeofence(geofenceId).subscribe({
      next: (assigned) => {
      //  console.log(assigned)
        this.assignedVehicles = assigned;
        this.selectedVehicleIds = assigned.map(v => v.id);
        this.cdr.detectChanges()
        this.formData.name = geoFenceName
        this.showAssignModal = true;
      }
    });
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.assignGeofenceId = null;
  }

  toggleVehicleSelection(vehicleId: string): void {
    const idx = this.selectedVehicleIds.indexOf(vehicleId);
    if (idx > -1) this.selectedVehicleIds.splice(idx, 1);
    else this.selectedVehicleIds.push(vehicleId);
  }

 saveAssignments(): void {
  if (!this.assignGeofenceId) return;

  const toUnassign = this.assignedVehicles.filter(v => !this.selectedVehicleIds.includes(v.id));
  const toAssign = this.allVehicles.filter(v =>
    this.selectedVehicleIds.includes(v.id) &&
    !this.assignedVehicles.some(av => av.id === v.id)
  );

  // Build observables using map
  const unassignObservables = toUnassign.map(v =>
    this.geofenceService.unassignVehicle(v.id, this.assignGeofenceId!)
  );
  const assignObservables = toAssign.map(v =>
    this.geofenceService.assignVehicle(v.id, this.assignGeofenceId!)
  );
  const observables = [...unassignObservables, ...assignObservables];

  if (observables.length === 0) {
    this.closeAssignModal();
    return;
  }

  forkJoin(observables).subscribe({
    next: () => {
      this.closeAssignModal();
      this.loadGeofences();
    },
    error: (err) => console.error(err)
  });
}

  deleteGeofence(id: string): void {
    if (confirm('Delete this geofence?')) {
      this.geofenceService.deleteGeofence(id).subscribe(() => this.loadGeofences());
    }
  }
}
