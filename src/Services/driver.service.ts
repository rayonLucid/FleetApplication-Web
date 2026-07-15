import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 🌟 Fixed: Import from Angular common HTTP
import { Observable } from 'rxjs';
import { CurrentTripInfo, DriverDashboardStats, DriverUpdatePayload, RecentTrip } from '../Data/data-interface';
import { ConfigService } from '../app/config.service';
// Adjust this path to where your component/interface lives

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  // 🌟 Point this to your secure C# backend API hosting address
  private apiUrl = '';
  private rootApiUrl = '';

  constructor(private http: HttpClient,private urlConfig:ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
      let rooturl =sessionStorage.getItem(this.urlConfig.approotUrl)
    this.apiUrl = `${url}drivers`;
    this.rootApiUrl =rooturl!

  }

  /**
   * Updates an existing driver profile within the tenant scope
   * Maps directly to C# [HttpPut("{id}")]
   */
  updateDriver(id: number, payload: DriverUpdatePayload): Observable<any> {
    // 🌟 Fixed: Changed .post to .put to align with your API definition
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  /**
   * Retrieves all drivers belonging to the authenticated user's company tenant
   * Pulls from C# [HttpGet("my-fleet")]
   */
  getCompanyFleet(): Observable<DriverUpdatePayload[]> {
    return this.http.get<DriverUpdatePayload[]>(`${this.apiUrl}/my-fleet`);
  }

  getDashboardStats(): Observable<DriverDashboardStats> {
  return this.http.get<DriverDashboardStats>(`${this.apiUrl}/stats`);
}
ActiveTrips():Observable<RecentTrip[]>{
return   this.http.get<RecentTrip[]>(`${this.rootApiUrl}admindashboard/recent-trips?limit=5`)
}
getCurrentTrip(): Observable<CurrentTripInfo | null> {
  return this.http.get<CurrentTripInfo | null>(`${this.apiUrl}/currenttrip`);
}
}
