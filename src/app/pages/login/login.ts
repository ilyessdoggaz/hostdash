import { Component } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  error = '';
  successMessage = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        this.successMessage = 'Account activated successfully! Please login.';
      }
    });
  }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.requiresOtp) {
          // Store email for OTP verification
          localStorage.setItem('pendingEmail', this.email);
          this.router.navigate(['/otp']);
        } else if (res.token) {
          // Successfully logged in
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Invalid credentials. Please check your email and password.';
      }
    });
  }
}
