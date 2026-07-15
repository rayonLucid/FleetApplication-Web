import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient } from '@angular/common/http';
import { Assignment, Vehicle } from '../../../../Data/data-interface';
import { ConfigService } from '../../../config.service';


@Component({
  selector: 'app-vehicle-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './vehicle-assignments.component.html',
  styleUrls: ['./vehicle-assignments.component.scss']
})
export class VehicleAssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];
  filtered: Assignment[] = [];
  isLoading = false;
  searchTerm = '';
  page = 1;
  pageSize = 6;
  showHistory = false;

  // For modals
  showAssignModal = false;
  showEndModal = false;
  selectedAssignment: Assignment | null = null;
  newAssignment = { vehicleId: '', driverId: '', reason: '' };
  vehicles: any[] = [];
  drivers: any[] = [];
cdr =inject(ChangeDetectorRef)
  private apiUrl = '';
  private vehiclesUrl = '';
  private driversUrl = '';

  constructor(private http: HttpClient,private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
      let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.apiUrl = `${url}vehicleassignments`;
      this.vehiclesUrl = `${url}vehicle`;
        this.driversUrl = `${url}drivers`;


  }

  ngOnInit(): void {
    this.loadLookups();
    this.loadAssignments();
  }

  loadLookups(): void {
    this.http.get<Vehicle[]>(this.vehiclesUrl).subscribe(
      data => {
      this.vehicles = data.filter(x =>x.isActive ==true)
      this.cdr.detectChanges()
     },
     error =>{
      console.log(error)
     }
    );
    this.http.get<any[]>(this.driversUrl).subscribe(data => this.drivers = data);
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.http.get<Assignment[]>(`${this.apiUrl}?history=${this.showHistory}`).subscribe({
      next: (data) => {
       // console.log(data)
        this.assignments = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges()
      },
      error: () => {
        this.isLoading = false;
          this.cdr.detectChanges()}
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filtered = [...this.assignments];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filtered = this.assignments.filter(a =>
        a.vehicleDisplay.toLowerCase().includes(term) ||
        a.driverName.toLowerCase().includes(term) ||
        (a.reason && a.reason.toLowerCase().includes(term))
      );
    }
    this.page = 1;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    this.loadAssignments();
  }

  openAssignModal(): void {
    this.newAssignment = { vehicleId: '', driverId: '', reason: '' };
    this.showAssignModal = true;
  }
IsAssigning =false
  createAssignment(): void {
    this.IsAssigning =true
    this.http.post(this.apiUrl, this.newAssignment).subscribe({
      next: () => {
        this.showAssignModal = false;
         this.IsAssigning =false
        this.loadAssignments();
         this.cdr.detectChanges()
      },
      error: (err) => {
        console.error(err)
 this.IsAssigning =false
 this.cdr.detectChanges()
      }
    });
  }

  openEndModal(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.showEndModal = true;
  }

  endAssignment(reason?: string): void {
    if (!this.selectedAssignment) return;
    this.http.put(`${this.apiUrl}/end`, { assignmentId: this.selectedAssignment.id, reason }).subscribe({
      next: () => {
        this.showEndModal = false;
        this.loadAssignments();
      },
      error: (err) => console.error(err)
    });
  }
}
