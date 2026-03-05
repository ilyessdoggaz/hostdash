import { Injectable } from "@angular/core";
import { API_BASE_URL } from "../api.config";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, map, delay } from "rxjs/operators";

export interface AuthResponse {
  token?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  verified?: boolean;
  requiresOtp?: boolean;
  requires2FA?: boolean;
  message?: string;
  status?: string;
  agencyId?: string;
  agenceId?: string;
}

@Injectable({
  providedIn: "root",
})
export class Auth {
  private apiUrl = `${API_BASE_URL}/auth`;

  private readonly demoEmail = "test@gmail.com";
  private readonly demoPassword = "new";
  private readonly demoOtp = "123456";

  private currentEmail: string | null = null;

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          this.currentEmail = email;
          if (response.token) {
            localStorage.setItem("token", response.token);
            // Save the full response to capture role, agencyId, etc.
            localStorage.setItem("user", JSON.stringify({ ...response, email }));
          }
          return { ...response, email };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  verifyOtp(email: string, otpCode: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/verify-otp`, { email, otpCode })
      .pipe(
        map((response) => response),
        catchError(this.handleError.bind(this))
      );
  }

  register(data: any): Observable<AuthResponse> {
    const payload = data.city ? data : {
      agencyName: data.agency?.name || data.agencyName,
      city: data.agency?.city || data.agencyCity,
      address: data.agency?.address || data.agencyAddress,
      zipCode: data.agency?.zip || data.agencyZip,
      matriculeFiscale: data.legal?.taxId || data.legalTaxId,
      firstName: data.manager?.firstName || data.managerFirstName,
      lastName: data.manager?.lastName || data.managerLastName,
      cinPassport: data.legal?.cin || data.cinPassport || "",
      phone: data.manager?.phone || data.managerPhone,
      email: data.manager?.email || data.email,
      password: data.password,
      confirmPassword: data.confirmPassword || data.password
    };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        map((response) => response),
        catchError(this.handleError.bind(this))
      );
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return of({
      message: "If this email exists, a password reset link has been sent."
    }).pipe(delay(1000));
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentEmail = null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  getCurrentEmail(): string | null {
    return this.currentEmail;
  }

  resendOtp(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/resend-otp?email=${email}`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  verify2FA(email: string, code: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/verify-2fa`, { email, code })
      .pipe(
        map((response) => {
          if (response.token) {
            localStorage.setItem("token", response.token);
            // Save the full response to capture role, agencyId, etc.
            localStorage.setItem("user", JSON.stringify({ ...response, email }));
          }
          return response;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: any) {
    console.error('AuthService Error:', error);
    let errorMessage = 'An error occurred. Please try again.';

    if (error.status === 0) {
      errorMessage = 'Cannot connect to backend server. Please check your internet or ensure backend is running.';
    } else if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      } else if (typeof error.error === 'object') {
        const messages = Object.values(error.error);
        if (messages.length > 0) errorMessage = messages.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => errorMessage);
  }
}
