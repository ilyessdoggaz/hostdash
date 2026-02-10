import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  // Use relative path for proxy to work
  private API_URL = '/api/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    // DEMO MODE: Bypass backend if email is 'test@test.com' and password is 'new'
    if (email.toLowerCase() === 'test@test.com' && password === 'new') {
      return of({ otpRequired: true, userId: 'demo-user-123' });
    }

    return this.http.post(`${this.API_URL}/login`, {
      email,
      password
    });
  }

  verifyOtp(userId: string, otp: string): Observable<any> {
    // DEMO MODE: Bypass backend if OTP is '123456'
    if (otp === '123456') {
      return of({ token: 'demo-fake-jwt-token' });
    }

    return this.http.post(`${this.API_URL}/verify-otp`, {
      userId,
      otp
    });
  }

  logout() {
    localStorage.clear();
    // In a real app, you might want to navigate to login here or notify state management
  }

  register(user: any): Observable<any> {
    // DEMO MODE
    return of({ success: true, message: 'Registration successful' });

    // Real backend call would be:
    // return this.http.post(`${this.API_URL}/register`, user);
  }

  forgotPassword(email: string): Observable<any> {
    // DEMO MODE
    return of({ success: true, message: 'Reset link sent to email' });

    // Real backend call would be:
    // return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }
}
