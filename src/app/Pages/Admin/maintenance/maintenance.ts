import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { HttpClient } from '@angular/common/http';
import { MaintenanceRecord } from '../../../../Data/data-interface';
import { MaintenanceService } from '../../../../Services/maintenance';
import { VehicleService } from '../../../../Services/vehicle.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './maintenance.html',
  styleUrls: ['./maintenance.scss']
})
export class MaintenanceComponent implements OnInit {
  records: MaintenanceRecord[] = [];
  filteredRecords: MaintenanceRecord[] = [];
  isLoading = false;
  searchTerm = '';
  page = 1;
  pageSize = 6;
  showCompleted = false;
  vehicles: any[] = [];
  filterVehicleId: string = '';

  // Modals
  showFormModal = false;
  isEditMode = false;
  selectedRecordId: string | null = null;
  formData = {
    vehicleId: '',
    serviceType: '',
    description: '',
    cost: null as number | null,
    serviceDate: '',
    nextServiceDate: ''
  };
  IsSaving = false;
today =formatDate( new Date(),"yyyy-MM-dd","en")
  constructor(private maintenanceService: MaintenanceService, private http: HttpClient,private vehicleService:VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadRecords();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicleDueforMentanance().subscribe(
      data =>{
      this.vehicles = data
      console.log(data)
    },error =>{
      console.log(error)
    }
  );
  }

  loadRecords(): void {
    this.isLoading = true;
    const vehicleId = this.filterVehicleId || undefined;
    this.maintenanceService.getRecords(vehicleId, this.showCompleted).subscribe({
      next: (data) => {
        this.records = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRecords = this.records.filter(r =>
      r.vehicleDisplay.toLowerCase().includes(term) ||
      r.serviceType.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term))
    );
    this.page = 1;
  }

  toggleCompleted(): void {
    this.showCompleted = !this.showCompleted;
    this.loadRecords();
  }

  onVehicleFilterChange(): void {
    this.loadRecords();
  }

  // ---- FORM MODAL ----
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRecordId = null;
    this.formData = { vehicleId: '', serviceType: '', description: '', cost: null, serviceDate: '', nextServiceDate: '' };
    this.showFormModal = true;
  }

  openEditModal(record: MaintenanceRecord): void {
    this.isEditMode = true;
    this.selectedRecordId = record.id;
    this.formData = {
      vehicleId: record.vehicleId,
      serviceType: record.serviceType,
      description: record.description || '',
      cost: record.cost || null,
      serviceDate: record.serviceDate.substring(0, 10),
      nextServiceDate: record.nextServiceDate ? record.nextServiceDate.substring(0, 10) : ''
    };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  saveRecord(): void {
    if (!this.formData.vehicleId || !this.formData.serviceType || !this.formData.serviceDate) {
      // basic validation
      return;
    }
    this.IsSaving = true;
    const payload = {
      vehicleId: this.formData.vehicleId,
      serviceType: this.formData.serviceType,
      description: this.formData.description || undefined,
      cost: this.formData.cost ?? undefined,
      serviceDate: new Date(this.formData.serviceDate).toISOString(),
      nextServiceDate: this.formData.nextServiceDate ? new Date(this.formData.nextServiceDate).toISOString() : undefined
    };
    if (this.isEditMode && this.selectedRecordId) {
      this.maintenanceService.updateRecord(this.selectedRecordId, payload).subscribe({
        next: () => { this.loadRecords(); this.closeFormModal(); this.IsSaving = false; },
        error: () => (this.IsSaving = false)
      });
    } else {
      this.maintenanceService.createRecord(payload).subscribe({
        next: () => { this.loadRecords(); this.closeFormModal(); this.IsSaving = false; },
        error: () => (this.IsSaving = false)
      });
    }
  }

  deleteRecord(id: string): void {
    if (confirm('Delete this maintenance record?')) {
      this.maintenanceService.deleteRecord(id).subscribe(() => this.loadRecords());
    }
  }
}
