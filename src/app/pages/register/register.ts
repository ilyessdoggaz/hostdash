import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  // Agency Info
  agencyName = '';
  agencyCity = '';
  agencyAddress = '';
  agencyZip = '';

  // Manager Info
  managerFirstName = '';
  managerLastName = '';
  managerPhone = '';
  // email is already defined

  // Authentication
  // password and confirmPassword are defined

  // Legal Info (Optional)
  legalName = '';
  legalRc = '';
  legalTaxId = '';

  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(private auth: Auth, private router: Router) { }

  register() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.auth.register({
      agency: {
        name: this.agencyName,
        city: this.agencyCity,
        address: this.agencyAddress,
        zip: this.agencyZip
      },
      manager: {
        firstName: this.managerFirstName,
        lastName: this.managerLastName,
        email: this.email,
        phone: this.managerPhone
      },
      legal: {
        legalName: this.legalName,
        rc: this.legalRc,
        taxId: this.legalTaxId
      },
      password: this.password
    }).subscribe({
      next: () => {
        // Success
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Registration failed';
      }
    });
  }
}
