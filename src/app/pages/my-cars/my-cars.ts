import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { PriceUpdateDialog } from '../../components/price-update-dialog/price-update-dialog';

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

    get maintenanceCount(): number {
        return this.vehicles.filter(v => v.status === 'MAINTENANCE').length;
    }

    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    constructor(
        private router: Router,
        private vehicleService: VehicleService
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

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    addNewCar() {
        this.router.navigate(['/add-car']);
    }

    viewDetails(vehicleId: string) {
        this.router.navigate(['/vehicle-details', vehicleId]);
    }



    deleteCar(vehicleId: string) {
        if (confirm('Are you sure you want to remove this vehicle?')) {
            this.vehicleService.deleteVehicle(String(vehicleId))
                .subscribe({
                    next: () => {
                        this.vehicles = this.vehicles.filter(v => String(v.id) !== String(vehicleId));
                        alert('Vehicle deleted successfully!');
                    },
                    error: (err) => {
                        console.error('Error deleting vehicle:', err);
                        alert('Failed to delete vehicle: ' + (typeof err === 'string' ? err : 'Please try again.'));
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
                        alert('Price updated successfully!');
                    },
                    error: (err) => {
                        console.error('Error updating price:', err);
                        this.priceUpdating = false;
                        alert('Failed to update price: ' + (typeof err === 'string' ? err : 'Please try again.'));
                    }
                });
        }
    }

    closePriceDialog() {
        this.showPriceDialog = false;
        this.selectedVehicle = null;
        this.priceUpdating = false;
    }
}
