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

  constructor(private auth: Auth, private router: Router, private route: ActivatedRoute) { }

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
    console.log(`[OTP] Verifying code for ${this.email}. Action: ${localStorage.getItem('pendingAction')}`);
    if (!this.email) {
      this.error = 'Email not found. Please login again.';
      return;
    }

    const action = localStorage.getItem('pendingAction');

    if (action === 'login') {
      this.auth.verify2FA(this.email, this.otpCode).subscribe({
        next: (res) => {
          console.log("[OTP] 2FA Success:", res);
          localStorage.removeItem('pendingEmail');
          localStorage.removeItem('pendingAction');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error("[OTP] 2FA Error:", err);
          this.error = typeof err === 'string' ? err : 'Invalid 2FA code';
        }
      });
    } else {
      // Default to registration OTP
      this.auth.verifyOtp(this.email, this.otpCode).subscribe({
        next: (res) => {
          console.log("[OTP] Registration OTP Success:", res);
          localStorage.removeItem('pendingEmail');
          localStorage.removeItem('pendingAction');
          this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
        },
        error: (err) => {
          console.error("[OTP] Registration OTP Error:", err);
          this.error = typeof err === 'string' ? err : 'Invalid OTP';
        }
      });
    }
  }

  resend() {
    if (!this.email) return;
    const action = localStorage.getItem('pendingAction');

    if (action === 'login') {
      this.error = 'For security, please go back to login to request a new 2FA code.';
      return;
    }

    this.auth.resendOtp(this.email).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'A new OTP has been sent.';
        this.error = '';
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to resend OTP.';
      }
    });
  }
}
