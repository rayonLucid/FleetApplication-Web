import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { DriverUpdatePayload } from '../../../Data/data-interface';
import { DriverService } from '../../../Services/driver.service';
import { DriverEditComponent } from '../driver-edit/driver-edit.component';




@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, DriverEditComponent],
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
  drivers: DriverUpdatePayload[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Pagination configuration parameters
  currentPage = 1;
  itemsPerPage = 6; // Grid configuration setup (2 rows of 3)

  // Modal State Control Parameters
  isModalOpen = false;
  selectedDriver: DriverUpdatePayload | null = null;
cdr =inject(ChangeDetectorRef)
  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.driverService.getCompanyFleet().subscribe({
      next: (data) => {
      //  console.log(data)
        this.drivers = data;
        this.isLoading = false;
        this.cdr.detectChanges()
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to retrieve company fleet allocation entries.';
        this.isLoading = false;
      }
    });
  }

  openEditModal(driver: DriverUpdatePayload): void {
    this.selectedDriver = { ...driver }; // Create a shallow clone to protect initial list state values
    this.isModalOpen = true;
  }

  closeEditModal(refreshList: boolean = false): void {
    this.isModalOpen = false;
    this.selectedDriver = null;
    if (refreshList) {
      this.loadDrivers(); // Re-fetch from the repository to update UI card values
    }
  }
}
