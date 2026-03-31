import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { AvailabilityService } from '../../services/availability.service';
import { Unavailability, UnavailabilityReason } from '../../models/availability.model';
import { NotificationService } from '../../services/notification.service';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-vehicle-details',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './vehicle-details.html',
    styleUrl: './vehicle-details.css'
})
export class VehicleDetails implements OnInit {
    public vehicle: Vehicle | null = null;
    public loading = true;
    public error: string | null = null;
    public selectedImage: string | null = null;
    public showFullImage = false;
    
    // Availability
    public unavailabilities: Unavailability[] = [];
    public loadingAvailability = false;
    public availabilityError: string | null = null;
    public blockForm = {
        startDate: '',
        endDate: '',
        reason: 'MAINTENANCE' as UnavailabilityReason
    };
    public isSubmittingBlock = false;
    public isUnblocking = false;

    get today(): string {
        return new Date().toISOString().split('T')[0];
    }

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private vehicleService = inject(VehicleService);
    private availabilityService = inject(AvailabilityService);
    private notificationService = inject(NotificationService);
    private location = inject(Location);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        console.log('[VehicleDetails] Component initialized');
        const id = this.route.snapshot.paramMap.get('id');
        console.log('[VehicleDetails] Route ID:', id);
        if (id) {
            this.loadVehicleDetails(id);
            this.loadAvailability(id);
        } else {
            this.error = 'No vehicle ID provided';
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    loadVehicleDetails(id: string) {
        console.log('[VehicleDetails] Starting to load vehicle:', id);
        this.loading = true;
        this.error = null;
        this.cdr.detectChanges();

        this.vehicleService.getVehicleById(id)
            .pipe(finalize(() => {
                console.log('[VehicleDetails] API call finalized');
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (vehicle) => {
                    console.log('[VehicleDetails] Received vehicle data:', vehicle);
                    if (vehicle) {
                        this.vehicle = vehicle;
                        if (vehicle.images && vehicle.images.length > 0) {
                            this.selectedImage = vehicle.images[0];
                        }
                    } else {
                        console.warn('[VehicleDetails] Received empty vehicle data');
                        this.error = 'Vehicle details are empty.';
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('[VehicleDetails] API Error:', err);
                    this.error = typeof err === 'string' ? err : 'Failed to load vehicle details. The vehicle may not exist or the server returned an error.';
                    this.cdr.detectChanges();
                }
            });
    }

    selectImage(img: string) {
        this.selectedImage = img;
        this.cdr.detectChanges();
    }

    toggleFullImage(show: boolean) {
        this.showFullImage = show;
        this.cdr.detectChanges();
    }

    goBack() {
        this.location.back();
    }

    getStatusClass(status: string | undefined): string {
        const statusMap: { [key: string]: string } = {
            'AVAILABLE': 'available',
            'RENTED': 'rented',
            'MAINTENANCE': 'maintenance',
            'INACTIVE': 'inactive'
        };
        const key = (status || '').toUpperCase();
        return `status-badge ${statusMap[key] || 'inactive'}`;
    }

    getStatusText(status: string | undefined): string {
        const statusMap: { [key: string]: string } = {
            'AVAILABLE': 'Available',
            'RENTED': 'Rented',
            'MAINTENANCE': 'Maintenance',
            'INACTIVE': 'Inactive'
        };
        const key = (status || '').toUpperCase();
        return statusMap[key] || status || 'Unknown';
    }

    // Availability Methods

    loadAvailability(vehicleId: string) {
        this.loadingAvailability = true;
        this.availabilityService.getUnavailabilities(vehicleId)
            .pipe(finalize(() => this.loadingAvailability = false))
            .subscribe({
                next: (data) => this.unavailabilities = data,
                error: (err) => this.availabilityError = err
            });
    }

    blockDates() {
        if (!this.vehicle || !this.blockForm.startDate || !this.blockForm.endDate) return;

        this.isSubmittingBlock = true;
        this.availabilityService.blockDates(this.vehicle.id, this.blockForm)
            .pipe(finalize(() => this.isSubmittingBlock = false))
            .subscribe({
                next: (res) => {
                    this.notificationService.showToast('Dates blocked successfully', 'success');
                    this.loadAvailability(this.vehicle!.id); // Full reload to get server-side IDs and sort order
                    this.blockForm.startDate = '';
                    this.blockForm.endDate = '';
                    this.blockForm.reason = 'MAINTENANCE';
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.notificationService.showToast(err, 'error');
                }
            });
    }

    unblockDates(unavailability: Unavailability) {
        if (!this.vehicle || !unavailability.startDate || !unavailability.endDate) return;

        this.isUnblocking = true;
        this.availabilityService.unblockDates(this.vehicle.id, { 
            startDate: unavailability.startDate ? String(unavailability.startDate).split('T')[0] : '',
            endDate: unavailability.endDate ? String(unavailability.endDate).split('T')[0] : ''
        })
        .pipe(finalize(() => {
            this.isUnblocking = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: () => {
                this.notificationService.showToast('Dates unblocked successfully', 'success');
                this.loadAvailability(this.vehicle!.id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.notificationService.showToast(err, 'error');
            }
        });
    }
}
