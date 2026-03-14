import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class Profile implements OnInit {
    user: any = {
        firstName: '',
        lastName: '',
        email: '',
        agencyName: '',
        agencyDetails: '',
        agencyLogo: null
    };

    constructor(
        private auth: Auth, 
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        const currentUser = this.auth.getCurrentUser();
        if (currentUser) {
            this.user.firstName = currentUser.firstName || '';
            this.user.lastName = currentUser.lastName || '';
            this.user.email = currentUser.email || '';

            // Load from local storage for persistence in demo
            const storedProfile = localStorage.getItem('hostProfile');
            if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                Object.assign(this.user, profile);
            } else {
                // Fallback to temp info from registration
                const storedInfo = localStorage.getItem('tempRegistrationInfo');
                if (storedInfo) {
                    const info = JSON.parse(storedInfo);
                    this.user.firstName = info.firstName || this.user.firstName;
                    this.user.lastName = info.lastName || this.user.lastName;
                    this.user.agencyName = info.agencyName || '';
                }
            }
        }
    }

    onLogoUpload(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.user.agencyLogo = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfile() {
        localStorage.setItem('hostProfile', JSON.stringify(this.user));
        this.notificationService.showToast('Profile updated successfully!', 'success');
        this.router.navigate(['/dashboard']);
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    async deleteAccount() {
        const confirmed = await this.notificationService.confirm(
            'Delete Account',
            'ARE YOU SURE? This action is permanent and will delete all your data.'
        );

        if (confirmed) {
            this.notificationService.showToast('Account deletion requested.', 'info');
            this.logout();
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
