import { Injectable } from "@angular/core";
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
  message?: string;
  status?: string;
}

@Injectable({
  providedIn: "root",
})
export class Auth {
  private apiUrl = "/api/auth";

  private readonly demoEmail = "test@test.com";
  private readonly demoPassword = "new";
  private readonly demoOtp = "123456";

  private currentEmail: string | null = null;

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          this.currentEmail = email; // Backend doesn't return email, so we use the input
          if (response.token) {
            localStorage.setItem("token", response.token);
            // We store a minimal user object since the backend only returns a token
            localStorage.setItem("user", JSON.stringify({ email, token: response.token }));
          }
          return { ...response, email };
        }),
        catchError((error) => {
          return throwError(() => error.error?.message || "Login failed");
        })
      );
  }

  verifyOtp(email: string, otpCode: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/verify-otp`, { email, otpCode })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          return throwError(() => error.error?.message || "OTP verification failed");
        })
      );
  }

  register(data: any): Observable<AuthResponse> {
    console.log("Auth.register called with:", data);

    // If data is already flat (new version), use it. Otherwise, map it (support legacy calls).
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
      .post<AuthResponse>(`${this.apiUrl}/register`, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(
        map((response) => {
          console.log("Auth.register success response:", response);
          return response;
        }),
        catchError((error) => {
          console.error("Auth.register ERROR HTTP:", error.status, error.statusText);
          console.error("Error Body from Backend:", error.error);

          let errorMessage = "Registration failed.";
          if (error.status === 403) {
            errorMessage = "Server rejected the request (403 Forbidden). This usually means a security blockage (CSRF or Invalid Session).";
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => ({ ...error, customMessage: errorMessage }));
        })
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/resend-otp?email=${email}`, {});
  }
}
