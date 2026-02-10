import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email = '';
  message = '';
  error = '';

  constructor(private auth: Auth) { }

  submit() {
    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.message = res.message;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to send reset link';
        this.message = '';
      }
    });
  }
}
