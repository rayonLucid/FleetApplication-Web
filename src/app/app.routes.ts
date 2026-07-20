import { Routes } from '@angular/router';
import { MapComponent } from './Pages/map/map.component';
import { DriverComponent } from './Pages/driver/driver.component';
import { LoginComponent } from './Pages/login/login.component';
import { DriverDashboardComponent } from './Pages/driver-dashboard/driver-dashboard.component';
import { AdminDashboardComponent } from './Pages/Admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './Auth/auth-guard';
import { UnauthorizedComponent } from './Auth/unauthorized/unauthorized.component';
import { MainLayoutComponent } from './Layouts/main-layout/main-layout.component';
import { VehiclesComponent } from './Pages/Admin/vehicles/vehicles.component';
import { VehicleAssignmentsComponent } from './Pages/Admin/vehicle-assignments/vehicle-assignments.component';
import { TripsComponent } from './Pages/trips/trips.component';
import { DriverTripsComponent } from './Pages/driver-trips/driver-trips.component';
import { GeofenceComponent } from './Pages/Admin/geofence/geofence.component';
import { MaintenanceComponent } from './Pages/Admin/maintenance/maintenance';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,   // layout with sidebar
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent, data: { role: 'Admin',title: 'Admin Dashboard' ,icon:'📊'} },
      { path: 'driver-dashboard', component: DriverDashboardComponent, data: { role: 'Driver',title: 'Driver Dashboard',icon:'📊' } },
      { path: 'drivers', component: DriverComponent, canActivate: [AuthGuard], data: { role: 'Admin',title: 'Drivers',icon:'👨‍✈️' } },
      { path: 'my-trips', component: DriverTripsComponent, canActivate: [AuthGuard], data: { role: 'Driver',title: 'My Trips' } },
      { path: 'vehicles', component: VehiclesComponent, canActivate: [AuthGuard], data: { role: 'Admin',title: 'Vehicles',icon:'🚛' } },
      { path: 'vehicle-assignments', component: VehicleAssignmentsComponent, canActivate: [AuthGuard], data: { role: 'Admin',title: 'Vehicle Assignments' ,icon:'🔗'} },
       { path: 'trips', component: TripsComponent, canActivate: [AuthGuard], data: { role: 'Admin' ,title: 'Trips'} },
         { path: 'tracking', component: MapComponent, canActivate: [AuthGuard], data: { role: 'Admin',title: 'Tracking' } },
         { path: 'geofences', component: GeofenceComponent, canActivate: [AuthGuard], data: { role: 'Admin',title: 'Geofences' } },
          { path: 'maintenance', component: MaintenanceComponent, canActivate: [AuthGuard], data: { role: 'Admin',title: 'Maintenance' } },

      // other protected routes
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/login' }
];

