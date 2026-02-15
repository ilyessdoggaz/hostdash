import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // CRITICAL: Force removal of Authorization header for public auth routes
  const isAuthRoute = req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/verify-otp');

  if (isAuthRoute) {
    console.log(`[AuthInterceptor] 🛡️ Public route detected. Explicitly removing headers for: ${req.url}`);
    // Clone with empty/deleted Authorization header
    req = req.clone({
      headers: req.headers.delete('Authorization')
    });
  } else if (token) {
    console.log(`[AuthInterceptor] 🔑 Adding token for protected route: ${req.url}`);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
