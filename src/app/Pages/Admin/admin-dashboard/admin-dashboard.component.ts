// admin-dashboard.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { DashboardStats, RecentTrip, FuelChartData, DailyActivityData, Vehicle } from '../../../../Data/data-interface';
import { ConfigService } from '../../../config.service';
import { VehicleService } from '../../../../Services/vehicle.service';
import { DriverService } from '../../../../Services/driver.service';
Chart.register(...registerables);



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  stats: DashboardStats | null = null;
  recentTrips: RecentTrip[] = [];
  fuelChartData: FuelChartData[] = [];
  dailyActivity: DailyActivityData[] = [];
  isLoading = true;
  error = '';
today =new Date()
cdr = inject(ChangeDetectorRef)
modalColumns: { label: string; key: string }[] = [];

// Properties
showDetailsModal = false;
modalTitle = '';
modalItems: any[] = [];
modalLoading = false;
modalError = '';


@ViewChild('fuelChart') set chartCanvasRef(content: ElementRef<HTMLCanvasElement>) {
  if (content) { // This runs automatically when *ngIf switches to true
    this.ChartCanvas = content;
    this.initChart();
  }
}
private ChartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  baseUrl = '';
 constructor(private http: HttpClient,private urlConfig:ConfigService
  ,private vehicleService:VehicleService,private driverService:DriverService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
      let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.baseUrl = `${url}admindashboard`;


  }


  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Chart will be created after data loads
   // this.initChart();
  }

  loadDashboard(): void {
  this.isLoading = true;


  Promise.all([
    this.http.get<DashboardStats>(`${this.baseUrl}/stats`).toPromise(),
    this.http.get<RecentTrip[]>(`${this.baseUrl}/recent-trips?limit=5`).toPromise(),
    this.http.get<DailyActivityData[]>(`${this.baseUrl}/daily-activity`).toPromise()   // <- fixed
  ]).then(([stats, trips, chartData]) => {
    this.stats = stats!;
    this.recentTrips = trips || [];
    this.dailyActivity = chartData || [];   // store in a new property

  //  this.initChart();
    this.isLoading = false;
    this.cdr.detectChanges()
  }).catch(err => {
    console.error("Error",err);
    this.error = 'Failed to load dashboard data.';
    this.isLoading = false;
  });
}

  initChart(): void {
console.log(this.ChartCanvas.nativeElement,"fuel Chart Canvas")

  if (!this.ChartCanvas.nativeElement && this.dailyActivity.length === 0) return;
  const labels = this.dailyActivity.map(d => new Date(d.date).toLocaleDateString());
  const data = this.dailyActivity.map(d => d.movementCount);   // or d.avgSpeed

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.ChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Fuel Level (%)',
          data: data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { beginAtZero: true, max: 100, title: { display: true, text: 'Fuel %' } }
        }
      }
    });
  }


  openDetails(type: string): void {
  this.modalItems = [];
  this.modalError = '';
  this.modalLoading = true;
  this.showDetailsModal = true;
 this.modalColumns = [];
  // Set title and fetch data based on type
  switch (type) {
    case 'maintenance':
      this.modalTitle = 'All Vehicles Under Mentanance';
      // Call your API to get vehicle list
       this.vehicleService.getVehicleUnderMentanance().subscribe({
         next: (data: Vehicle[]) => {
           this.modalItems = data.map(v => `${v.plateNumber} - ${v.vehicleName || 'Unnamed'}`);
           this.modalLoading = false;
            this.cdr.markForCheck()
         },
        error: () => { this.modalError = 'Failed to load vehicles.'; this.modalLoading = false; }
       });
      break;
       case 'drivers':
      this.modalTitle = 'Active Drivers';
      // Similar fetch for drivers
      break;
    case 'vehicles':
      this.modalTitle = 'All Vehicles';
        this.modalColumns = [
        { label: 'Plate', key: 'plateNumber' },
        { label: 'Name', key: 'vehicleName' },
        { label: 'Model', key: 'model' },
        { label: 'Status', key: 'isActive' }
      ];
       this.vehicleService.getVehicles().subscribe({
         next: (data: Vehicle[]) => {
         // console.log(data)
          // this.modalItems = data.map(v => `${v.plateNumber} - ${v.vehicleName || 'Unnamed'} -${v.model}`);
             this.modalItems = data.map(v => ({
            ...v,
            isActive: v.isActive ? '✅ Active' : '🔴 Inactive'
          }));
           this.cdr.markForCheck()
           this.modalLoading = false;
         },
        error: () => { this.modalError = 'Failed to load vehicles.'; this.modalLoading = false; }
       });
      break;
       case 'expired-licenses':
      this.modalTitle = 'Expiring Licenses (Next 30 Days)';
      this.modalColumns = [
        { label: 'Driver', key: 'fullName' },
        { label: 'License', key: 'licenseNumber' },
        { label: 'Expiry Date', key: 'licenseExpiryDate' }
      ];
      this.driverService.getExpiredLicenses().subscribe({
        next: (data: any[]) => {
          this.modalItems = data;
          this.modalLoading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.modalError = 'Failed to load expired licenses.'; this.modalLoading = false; }
      });
      break;

      case 'expiring-licenses':
  this.modalTitle = 'Expiring Licenses';
  this.modalColumns = [
    { label: 'Driver', key: 'fullName' },
    { label: 'License', key: 'licenseNumber' },
    { label: 'Expiry Date', key: 'licenseExpiryDate' }
  ];
  this.driverService.getExpiringLicenses().subscribe({
    next: (data) => {
      this.modalItems = data;
      this.modalLoading = false;
      this.cdr.markForCheck();
    },
    error: () => { this.modalError = 'Failed to load expiring licenses.'; this.modalLoading = false; }
  });
  break;

    // ... handle other types
    default:
      this.modalItems = ['No details available for this card.'];
      this.modalLoading = false;
  }
}

// Helper to safely get property from object
getProperty(item: any, key: string): string {
  if (key === 'isActive' && typeof item[key] === 'boolean') {
    return item[key] ? '✅ Active' : '🔴 Inactive';
  }
  if (key === 'fuelLevel' && item[key] !== undefined) {
    return item[key] + '%';
  }
  if (key === 'startTime' || key === 'timestamp' || key === 'licenseExpiryDate' || key === 'lastServiceDate') {
    return item[key] ? new Date(item[key]).toLocaleString() : '—';
  }
  return item[key] ?? '—';
}
closeDetails(): void {
  this.showDetailsModal = false;
}
}
