import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DriverService } from '../../../Services/driver.service';
import { DriverUpdatePayload } from '../../../Data/data-interface';




@Component({
  selector: 'app-driver-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driver-edit.component.html',
  styleUrl:'./driver-edit.component.scss'
})
export class DriverEditComponent implements OnInit {
  // Pass the target driver data via an Input property (e.g., from a list selection or modal context)
  @Input() driverData!: DriverUpdatePayload;

  editForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    if (!this.driverData) {
      this.errorMessage = 'No driver records selected for modification.';
      return;
    }
    this.initEditForm();
  }

  private initEditForm(): void {
    // Transform incoming expiry date to YYYY-MM-DD string format for safe HTML Date picker binding
    const formattedExpiryDate = this.driverData.licenseExpiryDate
      ? new Date(this.driverData.licenseExpiryDate).toISOString().substring(0, 10)
      : '';

    this.editForm = this.fb.group({
      id: [this.driverData.id],
      fullName: [this.driverData.fullName, [Validators.required, Validators.maxLength(100)]],
      phoneNumber: [this.driverData.phoneNumber, [Validators.required, Validators.pattern(/^[0-9+\s-]{7,20}$/)]],
      licenseNumber: [this.driverData.licenseNumber, [Validators.required, Validators.maxLength(50)]],
      licenseExpiryDate: [formattedExpiryDate, [Validators.required]],
      isActive: [this.driverData.isActive ?? true]
    });
  }

  // Utility getter methods for managing clean conditional validation templates
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: DriverUpdatePayload = this.editForm.value;

    // Call your centralized Angular service tier mapping to your C# Controller endpoint
    this.driverService.updateDriver(payload.id, payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Driver profile modified successfully.';
        this.isSubmitting = false;
        this.editForm.markAsPristine();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'An unexpected error occurred during database commit.';
        this.isSubmitting = false;
      }
    });
  }
}
