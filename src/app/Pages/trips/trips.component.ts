import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { HttpClient } from '@angular/common/http';
import { MapSearchResult, Trip } from '../../../Data/data-interface';
import { TripService } from '../../../Services/trip.service';
import { MapService } from '../../../Services/map.service';
import { ConfigService } from '../../config.service';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  isLoading = false;
  searchTerm = '';
  page = 1;
  pageSize = 6;
  showHistory = false;

  // For modals
  showStartModal = false;
  showEndModal = false;
  selectedTrip: Trip | null = null;
  newTrip = {
    vehicleId: '',
    driverId: '',
    startLocation: '',
    endLocation:'',
    status: 'Loading',
    totalDeliveries: 0,
      geofenceLng:0,
  geofenceLat:0,
  destinationLat:0,
  destinationLng:0
  };
  endTripData = {
    distanceKm: null,
    deliveriesComplete: null
  };

  vehicles: any[] = [];
  drivers: any[] = [];
  assignments: any[] = [];


// Add these properties
showEditModal = false;
editTripData: any = {
  vehicleId: '',
  driverId: '',
  startLocation: '',
  endLocation: '',
  status: '',
  totalDeliveries: 0
};
selectedEditTripId: string | null = null;
IsUpdating = false;


  cdr = inject(ChangeDetectorRef)
  mapservice =inject(MapService)
  vehicleUrl :string =''
  driverUrl :string =''
  vehicleassignmentUrl:string =''
  constructor(private tripService: TripService, private http: HttpClient,private toast:ToastrService,private urlConfig:ConfigService) {
  let url =sessionStorage.getItem(this.urlConfig.appUrl)!
     this.vehicleUrl =`${url}vehicle`
  this.driverUrl  ==`${url}drivers`
  this.vehicleassignmentUrl ==`${url}vehicleassignments?history=false`
  }

  ngOnInit(): void {
    this.loadLookups();
    this.loadTrips();
  }

  loadLookups(): void {
    this.http.get<any[]>( this.vehicleUrl).subscribe(data => {
      this.vehicles = data.filter(x =>x.isActive ==true)

    });
    this.http.get<any[]>( this.driverUrl).subscribe(data =>{
       this.drivers = data.filter(x =>x.isActive ==true);

     });
     this.http.get<any[]>(this.vehicleassignmentUrl )
      .subscribe(data => {
        this.assignments = data.filter(x =>x.isActive ==true);

      });
  }
onVehicleChange(vehicleId: any): void {
    // Find the assignment for this vehicle (only one active assignment per vehicle)
    const assignment = this.assignments.find(a => a.vehicleId === vehicleId.target.value);

    if (assignment) {
      // Pre-select the assigned driver and disable the driver dropdown
      this.newTrip.driverId = assignment.driverId;
      // Optional: show a message or disable the dropdown
    } else {
      this.newTrip.driverId = '';
      // Optionally show warning: no active driver assigned
    }
  }

  loadTrips(): void {
    this.isLoading = true;
    this.tripService.getTrips(this.showHistory).subscribe({
      next: (data) => {
        this.trips = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges()
      },
      error: () => (this.isLoading = false)
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTrips = [...this.trips];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTrips = this.trips.filter(t =>
        t.vehicleDisplay.toLowerCase().includes(term) ||
        t.driverName.toLowerCase().includes(term) ||
        (t.startLocation && t.startLocation.toLowerCase().includes(term)) ||
        (t.status && t.status.toLowerCase().includes(term))
      );
    }
    this.page = 1;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    this.loadTrips();
  }

  openStartModal(): void {
    this.newTrip = { vehicleId: '', driverId: '', startLocation: '',endLocation: '', status: 'In Transit', totalDeliveries: 0
  ,geofenceLng:0,
  geofenceLat:0,
  destinationLat:0,
  destinationLng:0};
    this.showStartModal = true;
  }
GetEndLocationInfo(searchQuery:string){

    this.mapservice.performSearch(searchQuery).then((data:MapSearchResult) =>{
      console.log(data)
       let SeachResult :MapSearchResult =data
       this.newTrip.endLocation =SeachResult.display_name
        this.newTrip.destinationLat =SeachResult.lat
         this.newTrip.destinationLng =SeachResult.lon

    })
}
IsCreating =false
  startTrip(): void {
    this.tripService.createTrip(this.newTrip).subscribe({
      next: () => {
        this.showStartModal = false;
this.IsCreating =false
this.cdr.detectChanges()
        this.loadTrips();
      },
      error: (err) =>{
        console.error(err)
        this.IsCreating =false
        this.cdr.detectChanges()
        this.toast.error(err.error);


      }
    });
  }

  openEndModal(trip: Trip): void {
    this.selectedTrip = trip;
    this.endTripData = {  distanceKm: null, deliveriesComplete: null };
    this.showEndModal = true;
  }

  endTrip(): void {
    if (!this.selectedTrip) return;
    const payload = {
      tripId: this.selectedTrip.id,
      ...this.endTripData
    };
    this.tripService.endTrips(payload).subscribe({
      next: () => {
        this.showEndModal = false;
        this.loadTrips();
      },
      error: (err) => console.error(err)
    });
  }

  deleteTrip(id: string): void {
    if (confirm('Delete this trip? This action cannot be undone.')) {
      this.tripService.deleteTrip(id).subscribe(() => this.loadTrips());
    }
  }


  // Method to open edit modal
openEditModal(trip: any): void {
  this.selectedEditTripId = trip.id;
  this.editTripData = {
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    startLocation: trip.startLocation || '',
    endLocation: trip.endLocation || '',
    status: trip.status || 'In Transit',
    totalDeliveries: trip.totalDeliveries || 0,
    destinationLat:0,
    destinationLng:0
  };
  this.showEditModal = true;
}
GetEditEndLocationInfo(searchQuery:string){

    this.mapservice.performSearch(searchQuery).then((data:MapSearchResult) =>{
      console.log(data)
        if(data.message !="Success"){
           this.toast.warning(data.message)
          return
        }
       let SeachResult :MapSearchResult =data
       this.editTripData.endLocation =SeachResult.display_name
        this.editTripData.destinationLat =SeachResult.lat
         this.editTripData.destinationLng =SeachResult.lon


    })
}
// Method to update trip
updateTrip(): void {
  if (!this.selectedEditTripId) return;
  this.IsUpdating = true;
  this.tripService.updateTrip(this.selectedEditTripId, this.editTripData).subscribe({
    next: () => {
      this.showEditModal = false;
      this.loadTrips();
      this.IsUpdating = false;
    },
    error: (err) => {
      console.error(err);
      this.IsUpdating = false;
    }
  });
}


}
