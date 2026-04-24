import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome-page', pathMatch: 'full' },
   { path: 'welcome-page',
    component: MapComponent,
    data: { noAuth: true }
  }
];
