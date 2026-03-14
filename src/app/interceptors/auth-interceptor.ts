import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // CRITICAL: Force removal of Authorization header for public auth routes
  const isAuthRoute = req.url.includes(`${API_BASE_URL}/auth/login`) ||
    req.url.includes(`${API_BASE_URL}/auth/register`) ||
    req.url.includes(`${API_BASE_URL}/auth/verify-otp`) ||
    req.url.includes(`${API_BASE_URL}/auth/verify-2fa`) ||
    req.url.includes(`${API_BASE_URL}/auth/resend-otp`);

  if (isAuthRoute) {
    console.log(`[AuthInterceptor] 🛡️ Public route detected. Explicitly removing headers for: ${req.url}`);
    // Clone with empty/deleted Authorization header
    req = req.clone({
      headers: req.headers.delete('Authorization')
    });
  } else if (token) {
    console.log(`[AuthInterceptor]🔑 Adding token for protected route: ${req.url}`);

    const user = localStorage.getItem('user');
    let agencyId = null;

    if (user) {
      const userData = JSON.parse(user);
      agencyId = userData._id || userData.id || userData.agencyId || userData.agenceId || userData.agency_id || userData.agence_id
        || userData.user?._id || userData.user?.id || userData.user?.agencyId || userData.user?.agenceId || userData.agence?.id || userData.agency?.id || null;
    }

    if (agencyId) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'X-Agency-Id': agencyId
        }
      });
    } else {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req);
};
