import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { PriceUpdateDialog } from '../../components/price-update-dialog/price-update-dialog';
import { IotService } from '../../services/iot.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-my-cars',
    standalone: true,
    imports: [CommonModule, PriceUpdateDialog],
    templateUrl: './my-cars.html',
    styleUrl: './my-cars.css'
})
export class MyCars implements OnInit {
    public vehicles: Vehicle[] = [];
    public loading = false;
    public error: string | null = null;
    public showPriceDialog = false;
    public selectedVehicle: Vehicle | null = null;
    public priceUpdating = false;

    get rentedCount(): number {
        return this.vehicles.filter(v => v.status === 'RENTED').length;
    }

    get availableCount(): number {
        return this.vehicles.filter(v => v.status === 'AVAILABLE').length;
    }


    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    constructor(
        public router: Router,
        private vehicleService: VehicleService,
        private iotService: IotService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadVehicles();
    }

    loadVehicles() {
        console.log('[MyCars] Calling vehicleService.getMyVehicles()...');
        this.loading = true;
        this.error = null;

        this.vehicleService.getMyVehicles()
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => { this.loading = false; })
            )
            .subscribe({
                next: (vehicles) => {
                    const list = Array.isArray(vehicles) ? [...vehicles] : [];
                    this.vehicles = list;
                    this.error = null;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('[MyCars] API Error:', err);
                    this.error = typeof err === 'string' ? err : 'Failed to load vehicles. Please try again.';
                    this.cdr.detectChanges();
                }
            });
    }

    getStatusClass(status: string | undefined): string {
        const statusMap: { [key: string]: string } = {
            'AVAILABLE': 'available',
            'RENTED': 'rented',
            'MAINTENANCE': 'maintenance',
            'INACTIVE': 'inactive',
            'ARCHIVED': 'inactive'
        };
        const key = (status || '').toUpperCase();
        return `status-badge ${statusMap[key] || 'inactive'}`;
    }

    getStatusText(status: string | undefined): string {
        const statusMap: { [key: string]: string } = {
            'AVAILABLE': 'Available',
            'RENTED': 'Rented',
            'MAINTENANCE': 'Maintenance',
            'INACTIVE': 'Inactive',
            'ARCHIVED': 'Archived'
        };
        const key = (status || '').toUpperCase();
        return statusMap[key] || status || 'Unknown';
    }

    isArchived(vehicle: Vehicle): boolean {
        if (!vehicle || !vehicle.status) return false;
        const s = vehicle.status.toUpperCase();
        return s === 'INACTIVE' || s === 'ARCHIVED';
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    addNewCar() {
        this.router.navigate(['/add-car']);
    }

    viewDetails(vehicleId: string) {
        this.router.navigate(['/vehicle-details', vehicleId]);
    }

    async archiveCar(vehicleId: string) {
        const confirmed = await this.notificationService.confirm(
            'Archive Vehicle',
            'Are you sure you want to archive this vehicle? It will no longer be visible in public searches.'
        );

        if (confirmed) {
            const id = String(vehicleId);
            this.vehicleService.archiveVehicle(id)
                .subscribe({
                    next: (updatedVehicle) => {
                        this.handleActionSuccess(id, updatedVehicle, 'archived');
                    },
                    error: (err) => {
                        console.warn('[MyCars] POST Archive failed, trying PATCH...', err);
                        this.vehicleService.archiveVehiclePatch(id).subscribe({
                            next: (updatedVehicle) => {
                                this.handleActionSuccess(id, updatedVehicle, 'archived');
                            },
                            error: (patchErr) => {
                                console.error('[MyCars] Archive failed:', patchErr);
                                this.notificationService.showToast(`Archive failed: ${patchErr}`, 'error');
                            }
                        });
                    }
                });
        }
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
                    next: (updatedVehicle) => {
                        this.handleActionSuccess(id, updatedVehicle, 'restored');
                    },
                    error: (err) => {
                        console.error('[MyCars] Restore failed:', err);
                        this.notificationService.showToast(`Restore failed: ${err}`, 'error');
                    }
                });
        }
    }

    private handleActionSuccess(id: string, updatedVehicle: any, action: string) {
        const index = this.vehicles.findIndex(v => String(v.id) === id);
        if (index !== -1) {
            this.vehicles[index] = updatedVehicle;
        }
        this.notificationService.showToast(`Vehicle ${action} successfully!`, 'success');
        this.cdr.detectChanges();
    }



    async deleteCar(vehicleId: string) {
        const confirmed = await this.notificationService.confirm(
            'Delete Vehicle',
            'Are you sure you want to remove this vehicle? This action cannot be undone.'
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

    updatePrice(vehicleId: string | number) {
        const vehicle = this.vehicles.find(v => String(v.id) === String(vehicleId));
        if (vehicle) {
            this.selectedVehicle = vehicle;
            this.showPriceDialog = true;
        }
    }

    onPriceUpdate(newPrice: number) {
        if (this.selectedVehicle && !this.priceUpdating) {
            this.priceUpdating = true;
            const id = String(this.selectedVehicle.id);

            this.vehicleService.updateVehiclePrice(id, { pricePerDay: Number(newPrice) })
                .subscribe({
                    next: (updatedVehicle) => {
                        const index = this.vehicles.findIndex(v => String(v.id) === id);
                        if (index !== -1) {
                            this.vehicles[index] = updatedVehicle;
                        }
                        this.priceUpdating = false;
                        this.closePriceDialog();
                        this.notificationService.showToast('Price updated successfully!', 'success');
                    },
                    error: (err) => {
                        console.error('Error updating price:', err);
                        this.priceUpdating = false;
                        this.notificationService.showToast('Failed to update price.', 'error');
                    }
                });
        }
    }

    closePriceDialog() {
        this.showPriceDialog = false;
        this.selectedVehicle = null;
        this.priceUpdating = false;
    }

    viewOnMap(vehicle: Vehicle) {
        if (vehicle && vehicle.vincode) {
            this.router.navigate(['/dashboard'], { queryParams: { vin: vehicle.vincode } });
        } else {
            this.notificationService.showToast('This vehicle does not have a VIN code for tracking.', 'warning');
        }
    }


}
