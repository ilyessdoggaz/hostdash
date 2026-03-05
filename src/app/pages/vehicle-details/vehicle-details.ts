import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-vehicle-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vehicle-details.html',
    styleUrl: './vehicle-details.css'
})
export class VehicleDetails implements OnInit {
    public vehicle: Vehicle | null = null;
    public loading = true;
    public error: string | null = null;
    public selectedImage: string | null = null;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private vehicleService = inject(VehicleService);
    private location = inject(Location);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        console.log('[VehicleDetails] Component initialized');
        const id = this.route.snapshot.paramMap.get('id');
        console.log('[VehicleDetails] Route ID:', id);
        if (id) {
            this.loadVehicleDetails(id);
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
}
