import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Trip } from '../../../Data/data-interface';
import { TripService } from '../../../Services/trip.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './driver-trips.component.html',
  styleUrls: ['./driver-trips.component.scss']
})
export class DriverTripsComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  isLoading = false;
  searchTerm = '';
  page = 1;
  pageSize = 6;
  showHistory = false;
cdr =inject(ChangeDetectorRef)
  // For end trip modal
  showEndModal = false;
  selectedTripId: string | null = null;
  endTripData = {
    endLocation: '',
    distanceKm: null as number | null,
    deliveriesComplete: null as number | null
  };

  constructor(private tripService: TripService,private toast:ToastrService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading = true;
    this.tripService.getDriverTrips(this.showHistory).subscribe({
      next: (data) => {
        this.trips = data;
       // console.log(data)
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges()
      },
      error: (err) => {
        this.isLoading = false
        this.toast.error(err.error);

     //   console.log(err.error)
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTrips = this.trips.filter(t =>
      t.vehicleDisplay.toLowerCase().includes(term) ||
      (t.startLocation && t.startLocation.toLowerCase().includes(term)) ||
      (t.status && t.status.toLowerCase().includes(term))
    );
    this.page = 1;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    this.loadTrips();
  }

  openEndModal(tripId: string): void {
    this.selectedTripId = tripId;
    this.endTripData = { endLocation: '', distanceKm: null, deliveriesComplete: null };
    this.showEndModal = true;
    this.cdr.detectChanges()
  }

  confirmEndTrip(): void {
    if (!this.selectedTripId) return;
    this.tripService.endTrip(
      this.selectedTripId,
      this.endTripData.endLocation || undefined,
      this.endTripData.distanceKm ?? undefined,
      this.endTripData.deliveriesComplete ?? undefined
    ).subscribe({
      next: () => {
        this.showEndModal = false;
        this.loadTrips(); // refresh list
      },
      error: (err) => console.error('Failed to end trip', err)
    });
  }

  cancelEndModal(): void {
    this.showEndModal = false;
    this.selectedTripId = null;
  }
}
