import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',

  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('FleetApplication');
token :any
  constructor(private authService: AuthService,private router:Router,private toastService:ToastrService) {
  // ✅ Check session on component load
   this.token =this.authService.getDecodedToken()
  if (this.authService.isSessionExpired()) {
      if(this.token!=null){
    this.handleSessionExpired();
      }
  }

//  console.log(this.token)
  // ✅ Check every 60 seconds
  setInterval(() => {
    if (this.authService.isSessionExpired()) {

      if(this.token!=null){
      this.handleSessionExpired();
      }
    }
  }, 60000); // 60 seconds

  // ✅ Warn if expiring soon (less than 5 minutes)
  if (this.authService.isSessionExpiringSoon()) {
    this.showExpirationWarning();
  }
}

// ✅ Handle expired session
handleSessionExpired(): void {
  console.log('Session expired! Logging out...');

  // Show message to user
  this.toastService.error('Your session has expired. Please log in again.');

  // Logout and redirect
  this.authService.logout();
  this.router.navigate(['/login']);
}

// ✅ Warn user before expiration
showExpirationWarning(): void {
  const minutes = this.authService.getTimeRemainingMinutes();
   if(this.token!=null){
  this.toastService.warning(`Your session will expire in ${minutes} minutes. Please save your work.`);
   }
}
}
