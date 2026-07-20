// src/app/services/sidebar-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  collapsed$ = this.collapsedSubject.asObservable();
  private mobileOpenSubject = new BehaviorSubject<boolean>(false);
mobileOpen$ = this.mobileOpenSubject.asObservable();
  toggle(): void {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }

  setCollapsed(state: boolean): void {
    this.collapsedSubject.next(state);
  }
toggleMobile(): void {
  this.mobileOpenSubject.next(!this.mobileOpenSubject.value);
}
setMobileOpen(state: boolean): void {
  this.mobileOpenSubject.next(state);
}


  getCollapsed(): boolean {
    return this.collapsedSubject.value;
  }
}
