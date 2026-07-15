// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router,private toastr:ToastrService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const requiredRole = route.data['role'] as string;

    // if (!isLoggedIn) {
    //   this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    //   return false;
    // }
  if (!isLoggedIn) {
   // this.toastr.error('Session expired – redirecting to login', 'Unauthorized');
     sessionStorage.removeItem("token");
     this.router.navigate(['/login'])
   // this.authService.logout();
    // throwError(() => new Error('Token expired'));
     return false
  }
    // If a specific role is required, check it
    if (requiredRole) {
      const userRole = this.authService.getRole();
      if (userRole !== requiredRole) {
        // Role not authorized – redirect to appropriate dashboard or home
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
