// admin-dashboard.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { DashboardStats, RecentTrip, FuelChartData, DailyActivityData } from '../../../../Data/data-interface';
import { ConfigService } from '../../../config.service';
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
  @ViewChild('fuelChart') fuelChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  baseUrl = '';
 constructor(private http: HttpClient,private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
      let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.baseUrl = `${url}admindashboard`;


  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Chart will be created after data loads
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
    this.initChart();
    this.isLoading = false;
    this.cdr.detectChanges()
  }).catch(err => {
    console.error(err);
    this.error = 'Failed to load dashboard data.';
    this.isLoading = false;
  });
}

  initChart(): void {
    if (!this.fuelChartCanvas || this.fuelChartData.length === 0) return;

  if (!this.fuelChartCanvas || this.dailyActivity.length === 0) return;
  const labels = this.dailyActivity.map(d => new Date(d.date).toLocaleDateString());
  const data = this.dailyActivity.map(d => d.movementCount);   // or d.avgSpeed

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.fuelChartCanvas.nativeElement, {
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
}
