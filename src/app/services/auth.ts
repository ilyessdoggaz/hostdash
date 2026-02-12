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
  private apiUrl = "http://localhost:8080/api/auth";

  private readonly demoEmail = "test@test.com";
  private readonly demoPassword = "new";
  private readonly demoOtp = "123456";

  private currentEmail: string | null = null;

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          this.currentEmail = response.email || null;
          if (response.token) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response));
          }
          return response;
        }),
        catchError((error) => {
          return throwError(() => error.error?.message || "Login failed");
        })
      );
  }

  verifyOtp(email: string, otpCode: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/verify-otp`, { email, code: otpCode })
      .pipe(
        map((response) => {
          if (response.token) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response));
          }
          return response;
        }),
        catchError((error) => {
          return throwError(() => error.error?.message || "OTP verification failed");
        })
      );
  }

  register(data: any): Observable<AuthResponse> {
    const agencyData = {
      email: data.manager?.email || data.email,
      password: data.password,
      name: data.agency?.name || data.agencyName,
      phoneNumber: data.manager?.phone || data.managerPhone,
      adminCin: "",
      rne: data.legal?.rc || data.legalRc || "",
      taxId: data.legal?.taxId || data.legalTaxId || ""
    };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/host`, agencyData)
      .pipe(
        map((response) => {
          this.currentEmail = response.email || null;
          return response;
        }),
        catchError((error) => {
          return throwError(() => error.error?.message || "Registration failed");
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
