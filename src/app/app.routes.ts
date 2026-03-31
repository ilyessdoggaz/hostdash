import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'otp', loadComponent: () => import('./pages/otp/otp').then(m => m.Otp) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard), canActivate: [authGuard] },
  { path: 'add-car', loadComponent: () => import('./pages/add-car/add-car').then(m => m.AddCar), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile), canActivate: [authGuard] },
  { path: 'my-cars', loadComponent: () => import('./pages/my-cars/my-cars').then(m => m.MyCars), canActivate: [authGuard] },
  { path: 'vehicle-details/:id', loadComponent: () => import('./pages/vehicle-details/vehicle-details').then(m => m.VehicleDetails), canActivate: [authGuard] },
  { path: 'vehicle-history/:id', loadComponent: () => import('./pages/vehicle-history/vehicle-history').then(m => m.VehicleHistory), canActivate: [authGuard] },
  { path: 'archived-cars', loadComponent: () => import('./pages/archived-cars/archived-cars').then(m => m.ArchivedCars), canActivate: [authGuard] },
  { path: 'point-de-relais', loadComponent: () => import('./pages/point-de-relais/point-de-relais').then(m => m.PointDeRelaisPage), canActivate: [authGuard] },
  { path: 'bookings', loadComponent: () => import('./pages/bookings/bookings').then(m => m.Bookings), canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
