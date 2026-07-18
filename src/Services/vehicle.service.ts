// src/app/services/vehicle.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, Vehicle } from '../Data/data-interface';
import { ConfigService } from '../app/config.service';


@Injectable({ providedIn: 'root' })
export class VehicleService {
//  private apiUrl = '';

 constructor(private http: HttpClient,private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
     // let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
  //  this.apiUrl = `${url}vehicle`;


  }
  get rootUrl():string{
   return `${this.urlConfig.apiUrl}`
}
get apiUrl():string{
   return `${this.urlConfig.apiUrl}vehicle`
}
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

   getVehicleAssignments(showHistory:boolean): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.rootUrl}VehicleAssignments?history=${showHistory}`);
  }

   getVehiclesToAssign(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/toAssign`);
  }


  getVehicle(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

   getVehicleUnderMentanance(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/VehicleUnderMentanance`);
  }
   getVehicleDueforMentanance(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/VehicleDueForMaintenance`);
  }

  createVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
