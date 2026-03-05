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
        if (res.requires2FA) {
          // Store email and action for 2FA verification
          localStorage.setItem('pendingEmail', this.email);
          localStorage.setItem('pendingAction', 'login');
          this.router.navigate(['/otp']);
        } else if (res.token) {
          // Successfully logged in (if 2FA is disabled on backend)
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error("Login Error:", err);
        this.error = typeof err === 'string' ? err : 'Invalid email or password';
      }
    });
  }
}
