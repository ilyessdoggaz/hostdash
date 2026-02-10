import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.otpRequired) {
          localStorage.setItem('userId', res.userId);
          this.router.navigate(['/otp']);
        }
      },
      error: () => {
        this.error = 'Invalid credentials';
      }
    });
  }
}
