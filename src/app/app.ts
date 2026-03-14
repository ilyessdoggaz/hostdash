import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Auth } from './services/auth';
import { GlobalNotificationComponent } from './components/global-notification/global-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, GlobalNotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Dashboard';
  public hostProfile: any = null;

  constructor(private auth: Auth, public router: Router) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const storedProfile = localStorage.getItem('hostProfile');
    if (storedProfile) {
      this.hostProfile = JSON.parse(storedProfile);
    } else {
      // Fallback to current user or registration info
      const currentUser = this.auth.getCurrentUser();
      const storedInfo = localStorage.getItem('tempRegistrationInfo');
      const info = storedInfo ? JSON.parse(storedInfo) : null;
      
      this.hostProfile = {
        agencyName: (currentUser as any)?.agencyName || info?.agencyName || ''
      };
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isAuthRoute(): boolean {
    const authRoutes = ['/login', '/register', '/otp', '/forgot-password'];
    // Handle cases where the URL might have query params or be just the base path
    const currentUrl = this.router.url.split('?')[0];
    return authRoutes.includes(currentUrl) || currentUrl === '/';
  }
}
