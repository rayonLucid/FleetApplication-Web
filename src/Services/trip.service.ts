import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../Data/data-interface';
import { ConfigService } from '../app/config.service';


@Injectable({ providedIn: 'root' })
export class TripService {
  private apiUrl = '';
  constructor(private http: HttpClient,private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
   //   let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.apiUrl = `${url}trips`;


  }

  getTrips(history: boolean = false): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}?history=${history}`);
  }
  updateDeliveries(tripId: string, count: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${tripId}/deliveries`, count);
}
updateStatus(tripId: string, status: string): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${tripId}/tripstatus`, { status });
}

  createTrip(data: any): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, data);
  }
updateTrip(id: string, data: any): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}`, data);
}
  endTrips(data: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/end`, data);
  }
   DriverEndTrips(data: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/driver/end`, data);
  }

  endTrip(tripId: string, endLocation?: string, distanceKm?: number, deliveriesComplete?: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/end`, { tripId, endLocation, distanceKm, deliveriesComplete });
}

  deleteTrip(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getDriverTrips(history: boolean): Observable<Trip[]> {
  return this.http.get<Trip[]>(`${this.apiUrl}/my-trips?history=${history}`);
}
}
