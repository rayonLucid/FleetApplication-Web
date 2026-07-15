import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // 🌟 Import the library function
import { LoginCredentials, AuthResponse, DecodedToken } from '../Data/data-interface';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ConfigService } from '../app/config.service';




@Injectable({
  providedIn: 'root'
})
export class AuthService {
 // config = inject(ConfigService)

  private readonly TOKEN_KEY = 'token';
  private authUrl = ``;
  constructor(private http: HttpClient,private toastr: ToastrService,private router:Router,private readonly urlConfig :ConfigService) {
    let url =sessionStorage.getItem(this.urlConfig.appUrl)
    this.authUrl = `${url}auth/login`;
    console.log(this.authUrl)

  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.authUrl, credentials).pipe(
      tap(response => {
      //  console.log(response)
        if (response && response.token) {
          if(!response.token.includes("Invalid credentials")){
          sessionStorage.setItem(this.TOKEN_KEY, response.token);
          }
        }
      })
    );
  }

  public getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 🌟 NEW: Decodes the active session token safely
   */
  public getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode the raw string into our structured TypeScript object
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Invalid token format found in session context:', error);
      return null;
    }
  }

  /**
   * 🌟 NEW: Helper utility to grab just the current Company GUID string
   */
  public getCompanyId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.companyId : null;
  }

    public getRole(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.role : null;
  }

  /**
   * 🌟 ENHANCED: Check if logged in AND ensure token isn't expired
   */
  public isLoggedIn(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.exp) {
    //console.warn('Token missing or invalid');
    return false;
  }


    // Convert current time to seconds to compare against JWT 'exp' claim timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    // console.log("Expiration Time",decoded.exp)
    //  console.log("Current Time",currentTime)
    let isLoggedin = decoded.exp > currentTime

    // console.log(isLoggedin,"is Logged In")
    return isLoggedin;
  }
// ✅ Returns TRUE if session expired
public isSessionExpired(): boolean {
  return !this.isLoggedIn();
}

// ✅ Get time remaining before expiration
public getTimeRemainingMinutes(): number {
  const decoded = this.getDecodedToken();
  if (!decoded || !decoded.exp) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  const remainingSeconds = decoded.exp - currentTime;
  return Math.floor(remainingSeconds / 60);
}

// ✅ Warning: Show alert if expiring soon (less than 5 minutes)
public isSessionExpiringSoon(): boolean {
  return this.getTimeRemainingMinutes() < 5;
}
  public logout(): void {
    let isloggedout =this.isLoggedIn()
    console.log(isloggedout)
    if(this.getToken()!=null &&  isloggedout==true ){
       this.toastr.error('Your session has expired. Please log in again.', 'Session Expired');
    }
    sessionStorage.removeItem(this.TOKEN_KEY);
        this.router.navigate(['/login']);
  }
}
