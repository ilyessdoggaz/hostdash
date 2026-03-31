import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-archived-cars',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './archived-cars.html',
    styleUrl: './archived-cars.css'
})
export class ArchivedCars implements OnInit {
    public vehicles: Vehicle[] = [];
    public loading = false;
    public error: string | null = null;

    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);
    public router = inject(Router);

    constructor(
        private vehicleService: VehicleService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadArchivedVehicles();
    }

    loadArchivedVehicles() {
        console.log('[ArchivedCars] Calling vehicleService.getArchivedVehicles()...');
        this.loading = true;
        this.error = null;

        this.vehicleService.getArchivedVehicles()
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => { 
                    this.loading = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: (vehicles) => {
                    this.vehicles = Array.isArray(vehicles) ? vehicles : [];
                    this.error = null;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('[ArchivedCars] API Error:', err);
                    this.error = typeof err === 'string' ? err : 'Failed to load archived vehicles.';
                    this.cdr.detectChanges();
                }
            });
    }

    async restoreCar(vehicleId: string) {
        const confirmed = await this.notificationService.confirm(
            'Restore Vehicle',
            'Are you sure you want to restore this vehicle to your active fleet?'
        );

        if (confirmed) {
            const id = String(vehicleId);
            this.vehicleService.restoreVehicle(id)
                .subscribe({
                    next: () => {
                        this.vehicles = this.vehicles.filter(v => String(v.id) !== id);
                        this.notificationService.showToast('Vehicle restored successfully!', 'success');
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('[ArchivedCars] Restore failed:', err);
                        this.notificationService.showToast(`Restore failed: ${err}`, 'error');
                    }
                });
        }
    }

    async deleteCar(vehicleId: string) {
        const confirmed = await this.notificationService.confirm(
            'Delete Vehicle',
            'Are you sure you want to permanently delete this vehicle? This action cannot be undone.'
        );

        if (confirmed) {
            this.vehicleService.deleteVehicle(String(vehicleId))
                .subscribe({
                    next: () => {
                        this.vehicles = this.vehicles.filter(v => String(v.id) !== String(vehicleId));
                        this.notificationService.showToast('Vehicle deleted successfully!', 'success');
                    },
                    error: (err) => {
                        console.error('Error deleting vehicle:', err);
                        this.notificationService.showToast('Failed to delete vehicle.', 'error');
                    }
                });
        }
    }

    viewDetails(vehicleId: string) {
        this.router.navigate(['/vehicle-details', vehicleId]);
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    getStatusClass(status: string | undefined): string {
        return 'status-badge inactive';
    }

    getStatusText(status: string | undefined): string {
        return 'Archived';
    }
}
