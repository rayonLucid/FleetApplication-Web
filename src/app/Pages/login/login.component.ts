import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { ConfigService } from '../../config.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
cdr =inject(ChangeDetectorRef)
  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // 🌟 Injected the new service tier
    private router: Router,private toast:ToastrService
  ) {
   
  }

  ngOnInit(): void {
    // Structural flush: ensure stale authentication tokens are purged on initialization
    this.authService.logout();

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Execute auth service transaction
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Redirection executes confidently; the token is already safely saved in the session store
//console.log(response)
  if(!response.token.includes("Invalid credentials")){
        let role =   this.authService.getRole()
        console.log(role)
     if(role?.toLowerCase().includes("driver")){
       console.log(role)
        this.router.navigate(['/driver-dashboard']);
          this.isSubmitting = false;
        this.cdr.detectChanges()
     }else{
       this.router.navigate(['/dashboard']);
         this.isSubmitting = false;
        this.cdr.detectChanges()
     }
    }else{
         this.errorMessage =  'Invalid email or password combination.';
        this.isSubmitting = false;
        this.cdr.detectChanges()
    }
      },
      error: (err) => {
        console.log("Error",err)
        this.errorMessage = err?.error?.message || 'Please Confirm your Api is running or Check your internet connection';
        this.isSubmitting = false;

        this.cdr.detectChanges()
        this.toast.error(this.errorMessage!)
      }
    });
  }
}
