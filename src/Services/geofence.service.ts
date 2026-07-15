import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Geofence, Vehicle } from '../Data/data-interface';
import { ConfigService } from '../app/config.service';


@Injectable({ providedIn: 'root' })
export class GeofenceService {
  private apiUrl = '';
vehicleUrl =''
constructor(private http: HttpClient,private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
      let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.apiUrl = `${url}geofences`;
this.vehicleUrl = `${url}vehicle`

  }

  getGeofences(includeInactive: boolean = false): Observable<Geofence[]> {
    return this.http.get<Geofence[]>(`${this.apiUrl}?inactive=${includeInactive}`);
  }

  createGeofence(data: Partial<Geofence>): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, data);
  }

  updateGeofence(id: string, data: Partial<Geofence>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  deleteGeofence(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignVehicle(vehicleId: string, geofenceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign`, { vehicleId, geofenceId });
  }

  unassignVehicle(vehicleId: string, geofenceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/unassign`, { vehicleId, geofenceId });
  }

  getGeofencesByVehicle(vehicleId: string): Observable<Geofence[]> {
  return this.http.get<Geofence[]>(`${this.apiUrl}/vehicle/${vehicleId}`);
}

  getVehiclesForGeofence(geofenceId: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/${geofenceId}/vehicles`);
  }

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.vehicleUrl);
  }
}
