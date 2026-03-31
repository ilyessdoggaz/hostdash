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
    req = req.clone({
      headers: req.headers.delete('Authorization')
    });
  } else if (token) {
    console.log(`[AuthInterceptor] 🔑 Adding token for protected route: ${req.url}`);

    // Decode JWT payload — the authoritative source for the agency identity
    let agencyId: string | null = null;
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        // Extract agencyId from JWT claims (most reliable)
        agencyId = payload.agencyId || payload.agenceId || payload.agency_id
          || payload.agency?.id || null;
        console.log('[AuthInterceptor] JWT payload:', payload, '| agencyId:', agencyId);
      }
    } catch (e) {
      console.warn('[AuthInterceptor] Could not decode JWT payload:', e);
    }

    // Fallback: check the stored user object — but NEVER use _id (that is the user's own ID)
    if (!agencyId) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          agencyId = userData.agencyId || userData.agenceId || userData.agency_id || userData.agence_id
            || userData.agency?.id || userData.agence?.id
            || userData.user?.agencyId || userData.user?.agenceId || null;
          console.log('[AuthInterceptor] Fallback agencyId from stored user:', agencyId);
        } catch (e) {
          console.warn('[AuthInterceptor] Could not parse stored user:', e);
        }
      }
    }

    // Add headers that the backend (Vehicle Service) expects from the Gateway
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    // Authorities / Roles extraction for the backend's GatewayHeaderAuthFilter
    let role: string | null = null;
    let email: string | null = null;

    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        role = payload.role || payload.roles?.[0] || (payload.realm_access?.roles?.includes('AGENCE') ? 'AGENCE' : null);
        email = payload.email || payload.sub || payload.preferred_username;
        
        // Re-extract agencyId just to be sure we have the latest from payload
        agencyId = payload.agencyId || payload.agenceId || payload.agency_id || agencyId;
      }
    } catch (e) {
      console.warn('[AuthInterceptor] Error extracting claims for headers:', e);
    }

    if (role) headers['X-User-Role'] = role;
    if (email) headers['X-User-Email'] = email;
    if (agencyId) {
      headers['X-Agency-Id'] = agencyId;
      console.log('[AuthInterceptor] 🚀 Injecting Identity Headers:', { role, email, agencyId });
    }

    req = req.clone({ setHeaders: headers });
  }

  return next(req);
};
