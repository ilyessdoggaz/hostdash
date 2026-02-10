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
  userId = '';

  constructor(private auth: Auth, private router: Router) {
    this.userId = localStorage.getItem('userId') || '';
  }

  verify() {
    if (!this.userId) {
      this.error = 'User ID not found. Please login again.';
      return;
    }

    this.auth.verifyOtp(this.userId, this.otpCode).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.error = 'Invalid OTP';
      }
    });
  }
}
