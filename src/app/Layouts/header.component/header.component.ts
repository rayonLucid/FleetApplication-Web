import { ChangeDetectorRef, Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SidebarStateService } from '../../../Services/sidebar-state';

@Component({
  selector: 'app-header',
  imports: [FormsModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
   userFullName: string = '';
   pageTitle=""
   today = Date()
  userRole: string = '';
  cdref =inject(ChangeDetectorRef)
@Output() toggleMobile = new EventEmitter<void>();
  constructor(private authService: AuthService, private router: Router,
    private activatedRoute: ActivatedRoute,private sidebarState: SidebarStateService) {

        this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    const route = this.router.routerState.snapshot.root;
    let title = '';
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    this.pageTitle = current.data['title'] || 'Dashboard';
  });
    }

  ngOnInit(): void {
    const token = this.authService.getDecodedToken();

    if (token) {
      this.userFullName = token.userId  || 'User';
      this.userRole =  this.authService.getRole() || '';
    }

  }
 getPageTitle(): string {
    return this.pageTitle;
  }
toggleSidebar(): void {
  this.sidebarState.toggle();
}
  logout(): void {
    this.authService.logout();
  }
}
