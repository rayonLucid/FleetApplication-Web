import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';


interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];   // which roles can see this item
}

@Component({
  selector: 'app-sidebar',
   standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  userRole: string | null = null;
 // isCollapsed = false;
   @Input() isCollapsed = false;
   @Input() isMobileOpen = false;
@Output() toggleMobile = new EventEmitter<boolean>();
  constructor(private authService: AuthService, public router: Router) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
  //  console.log(this.userRole)
    this.buildMenu();
  }

  buildMenu(): void {
    this.menuItems = [
      { label: 'Dashboard', icon: '📊', route: '/dashboard', roles: ['Admin'] },
      { label: 'Drivers', icon: '👨‍✈️', route: '/drivers', roles: ['Admin'] },
      { label: 'Vehicles', icon: '🚛', route: '/vehicles', roles: ['Admin'] },
      { label: 'Vehicle Assignments', icon: '🚛', route: '/vehicle-assignments', roles: ['Admin'] },
       { label: 'Live Tracking', icon: '🚗', route: '/tracking', roles: ['Admin'] },
      { label: 'Trips', icon: '🔄', route: '/trips', roles: ['Admin'] },
      { label: 'Geofences', icon: '🌍', route: '/geofences', roles: ['Admin'] },
      { label: 'My Dashboard', icon: '📱', route: '/driver-dashboard', roles: ['Driver'] },
      { label: 'My Trips', icon: '🚗', route: '/my-trips', roles: ['Driver'] },
      { label: 'Vehicle Maintenance', icon: '🛠️', route: '/maintenance', roles: ['Admin'] }
    ];
  }

  isVisible(item: MenuItem): boolean {
    return item.roles.includes(this.userRole || '');
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isMobileOpen =!this.isMobileOpen
  }
  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
