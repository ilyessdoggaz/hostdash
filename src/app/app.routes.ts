import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Otp } from './pages/otp/otp';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { AddCar } from './pages/add-car/add-car';
import { Profile } from './pages/profile/profile';
import { MyCars } from './pages/my-cars/my-cars';
import { VehicleDetails } from './pages/vehicle-details/vehicle-details';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'otp', component: Otp },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'add-car', component: AddCar, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'my-cars', component: MyCars, canActivate: [authGuard] },
  { path: 'vehicle-details/:id', component: VehicleDetails, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
