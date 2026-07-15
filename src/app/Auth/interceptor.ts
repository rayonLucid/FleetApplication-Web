import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {


const authService = inject(AuthService);
const toastr =inject(ToastrService)
const token = authService.getToken();
//  console.log(token)
 if (!authService.isLoggedIn()) {
   console.log(req.url)
 //   toastr.error('Session expired – redirecting to login', 'Unauthorized');
    authService.logout();
    throwError(() => new Error('Token expired'));

  }
  // If a token exists, clone the request and inject the authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
