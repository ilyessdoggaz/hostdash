import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css',
})
export class Otp implements OnInit {
  otpCode = '';
  error = '';
  successMessage = '';
  email = '';

  constructor(private auth: Auth, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.email = localStorage.getItem('pendingEmail') || '';
    console.log("OTP Component initialized. Pending email:", this.email);

    // Only redirect to dashboard if logged in AND not in the middle of OTP verification
    if (this.auth.isLoggedIn() && !this.email) {
      console.log("User is logged in but no pending email, redirecting to dashboard");
      this.router.navigate(['/dashboard']);
      return;
    }

    // If no pending email and not logged in, redirect to login
    if (!this.email) {
      console.log("No pending email found, redirecting to login");
      this.router.navigate(['/login']);
      return;
    }

    // Get success message from registration
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
      }
    });
  }

  verify() {
    if (!this.email) {
      this.error = 'Email not found. Please login again.';
      return;
    }

    this.auth.verifyOtp(this.email, this.otpCode).subscribe({
      next: (res) => {
        // Backend doesn't return a token on OTP verification success
        // User must log in after account activation
        localStorage.removeItem('pendingEmail');
        this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Invalid OTP';
      }
    });
  }

  resend() {
    if (!this.email) return;
    this.auth.resendOtp(this.email).subscribe({
      next: (res) => {
        this.error = res.message || 'A new OTP has been sent to your device.';
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to resend OTP. Please try again.';
      }
    });
  }
}
