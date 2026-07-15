import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Vehicle } from '../../../../Data/data-interface';
import { VehicleService } from '../../../../Services/vehicle.service';


@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  selectedVehicleId: string | null = null;
  vehicleForm: FormGroup;

  // Pagination
  page = 1;
  pageSize = 9; // number of cards per page

  // Search
  searchTerm = '';
cdr =inject(ChangeDetectorRef)
  constructor(private vehicleService: VehicleService, private fb: FormBuilder) {
    this.vehicleForm = this.fb.group({
      plateNumber: ['', Validators.required],
      vehicleName: ['' , Validators.required],
      model: [''],
      year: [null, [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      fuelType: ['' , Validators.required],
      capacity: [0, [Validators.min(0)]],
      isActive: [true],
      nextMaintenanceDate: [''],
      imei: ['']
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.applyFilter();
        this.isLoading = false;
this.cdr.detectChanges()
      },
      error: (err) => {
        console.error('Failed to load vehicles', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVehicles = [...this.vehicles];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredVehicles = this.vehicles.filter(v =>
        v.plateNumber.toLowerCase().includes(term) ||
        (v.vehicleName && v.vehicleName.toLowerCase().includes(term)) ||
        (v.model && v.model.toLowerCase().includes(term)) ||
        (v.imei && v.imei.toLowerCase().includes(term))
      );
    }
    this.page = 1; // reset to first page after filter
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedVehicleId = null;
    this.vehicleForm.reset({ isActive: true });
    this.showModal = true;
  }

  openEditModal(vehicle: Vehicle): void {
    this.isEditMode = true;
    this.selectedVehicleId = vehicle.id;
    this.vehicleForm.patchValue({
      plateNumber: vehicle.plateNumber,
      vehicleName: vehicle.vehicleName,
      model: vehicle.model,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      capacity: vehicle.capacity,
      isActive: vehicle.isActive,
      nextMaintenanceDate: vehicle.nextMaintenanceDate ? vehicle.nextMaintenanceDate.substring(0, 10) : '',
      imei: vehicle.imei
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.vehicleForm.reset({ isActive: true });
  }
// ✅ Get first invalid field with error message
getFirstInvalidField(): { name: string; error: string } | null {
  for (const key in this.vehicleForm.controls) {
    const control = this.vehicleForm.get(key);
    if (control && control.invalid) {
      const errors = control.errors;
      const errorType = Object.keys(errors || {})[0];

      // ✅ Map error types to user-friendly messages
      const errorMessages: { [key: string]: string } = {
        required: `${key} is required`,
        minlength: `${key} must be at least ${errors!['minlength']?.requiredLength} characters`,
        maxlength: `${key} must be at most ${errors!['minlength']?.requiredLength} characters`,
        pattern: `${key} has invalid format`,
        email: `${key} must be a valid email`,
        min: `${key} must be at least ${errors!['min']?.min}`,
        max: `${key} must be at most ${errors!['max']?.max}`
      };

      return {
        name: this.getControlName(key),
        error: errorMessages[errorType] || `${key} is invalid`
      };
    }
  }
  return null;
}

// ✅ Get friendly control name (from formGroup or fallback)
getControlName(key: string): string {

 return key.replace(/([A-Z])/g, ' $1').trim(); // Or use a mapping if you have custom names
}

// ✅ Show alert (using native alert or custom modal)
showFieldAlert(field: string, error: string): void {
  // Option 1: Native alert (simple)
  alert(`${field}: ${error}`);

  // Option 2: Custom alert/modal (better UX)
  // this.alertService.show(`${field}: ${error}`, 'error');

  // Option 3: Toast notification
  // this.toastService.error(`${field}: ${error}`);
}

showSuccessAlert(title: string, message: string): void {
  alert(`${title}: ${message}`);
  // Or: this.toastService.success(message);
}

showErrorAlert(title: string, message: string): void {
  alert(`${title}: ${message}`);
  // Or: this.toastService.error(message);
}
  saveVehicle(): void {
      console.log(this.vehicleForm.invalid)
    if (this.vehicleForm.invalid) {
      Object.keys(this.vehicleForm.controls).forEach(key => {
        this.vehicleForm.get(key)?.markAsTouched();
      });

       const firstInvalidField = this.getFirstInvalidField();
    if (firstInvalidField) {
      this.showFieldAlert(firstInvalidField.name, firstInvalidField.error);
    }
      return;
    }

    const formValue = this.vehicleForm.value;
    if (formValue.nextMaintenanceDate) {
      formValue.nextMaintenanceDate = new Date(formValue.nextMaintenanceDate).toISOString();
    }

    if (this.isEditMode && this.selectedVehicleId) {
      this.vehicleService.updateVehicle(this.selectedVehicleId, formValue).subscribe({
        next: () => {
          this.loadVehicles();
          this.closeModal();
        },
        error: (err) => console.error('Update failed', err)
      });
    } else {
    //  console.log(formValue)
      this.vehicleService.createVehicle(formValue).subscribe({
        next: () => {
          this.loadVehicles();
          this.closeModal();
        },
        error: (err) => console.error('Create failed', err)
      });
    }
  }

  deleteVehicle(id: string): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => this.loadVehicles(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}
