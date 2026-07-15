import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GpsData } from '../Data/data-interface';
import { ConfigService } from '../app/config.service';

// Define the shape of your data to match the .NET GpsDataDto


@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private http = inject(HttpClient);
  private apiUrl = ''; // Update to your .NET URL
constructor(private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
   //   let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.apiUrl = `${url}telemetry`;


  }
  sendLocationUpdate(data: GpsData): Observable<any> {
    return this.http.post(`${this.apiUrl}/receive`, data);
  }
}
