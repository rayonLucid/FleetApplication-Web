import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {  RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header.component/header.component';
import { SidebarStateService } from '../../../Services/sidebar-state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout.component',
  imports: [SidebarComponent,RouterOutlet,HeaderComponent,CommonModule],
  standalone:true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
   isSidebarCollapsed = false;
   isMobileOpen = false;
    constructor(private sidebarState: SidebarStateService) {}
     ngOnInit(): void {
    this.sidebarState.collapsed$.subscribe(state => {
      this.isSidebarCollapsed = state;
    });
     this.sidebarState.mobileOpen$.subscribe(state => this.isMobileOpen = state);
  }

  toggleMobile(): void {
  this.sidebarState.toggleMobile();
}
closeMobile(): void {
  this.sidebarState.setMobileOpen(false);
}
}

