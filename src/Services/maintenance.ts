import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../app/config.service';
import { MaintenanceRecord } from '../Data/data-interface';


@Injectable({ providedIn: 'root' })
export class MaintenanceService {


  constructor(private http: HttpClient,private urlConfig:ConfigService) {}
get apiUrl():string {
  return `${this.urlConfig.apiUrl}maintenance`
}
  getRecords(vehicleId?: string, completed?: boolean): Observable<MaintenanceRecord[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (vehicleId) params.set('vehicleId', vehicleId);
    if (completed) params.set('completed', 'true');
    return this.http.get<MaintenanceRecord[]>(`${url}?${params.toString()}`);
  }

  createRecord(data: any): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, data);
  }

  updateRecord(id: string, data: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  deleteRecord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
