import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
export class Otp {
  otpCode = '';
  error = '';
  email = '';

  constructor(private auth: Auth, private router: Router) {
    this.email = localStorage.getItem('pendingEmail') || '';
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  verify() {
    if (!this.email) {
      this.error = 'Email not found. Please login again.';
      return;
    }

    this.auth.verifyOtp(this.email, this.otpCode).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.removeItem('pendingEmail'); // Clean up
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.error = 'Invalid OTP';
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
