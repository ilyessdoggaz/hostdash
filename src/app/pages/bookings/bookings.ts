import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { VehicleService } from '../../services/vehicle.service';
import { BookingService } from '../../services/booking.service';
import { Vehicle } from '../../models/vehicle.model';
import { Booking } from '../../models/booking.model';

interface BookingViewModel {
    id: string;
    vehicle: Vehicle;
    startDate: string;
    endDate: string;
    status: string;
    totalPrice?: number;
}

@Component({
    selector: 'app-bookings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bookings.html',
    styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
    public bookings: BookingViewModel[] = [];
    public loading = false;
    public error: string | null = null;

    public router = inject(Router);
    private vehicleService = inject(VehicleService);
    private bookingService = inject(BookingService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        this.loadBookings();
    }

    loadBookings() {
        console.log('[Bookings] Loading data...');
        this.loading = true;
        this.error = null;

        forkJoin({
            vehicles: this.vehicleService.getMyVehicles().pipe(
                catchError(err => {
                    console.error('[Bookings] Vehicles load error:', err);
                    return of([]);
                })
            ),
            bookings: this.bookingService.getMyBookings().pipe(
                catchError(err => {
                    console.error('[Bookings] Bookings load error:', err);
                    return of([]);
                })
            )
        }).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (results) => {
                const { vehicles, bookings } = results;
                console.log(`[Bookings] Received ${vehicles.length} vehicles and ${bookings.length} bookings`);
                
                const vehicleMap = new Map<string, Vehicle>();
                vehicles.forEach(v => vehicleMap.set(String(v.id), v));

                this.bookings = bookings.map(b => {
                    const vId = String(b.vehicleId);
                    const vehicle = vehicleMap.get(vId);
                    
                    if (!vehicle) {
                        console.warn(`[Bookings] Vehicle not found for ID: ${vId}`);
                    }

                    return {
                        id: b.id,
                        vehicle: vehicle || { 
                            id: b.vehicleId, 
                            brand: 'Unknown', 
                            model: 'Vehicle', 
                            images: [], 
                            matricule: 'Unknown',
                            status: 'AVAILABLE'
                        } as any,
                        startDate: b.startDate,
                        endDate: b.endDate,
                        status: b.status,
                        totalPrice: b.totalPrice
                    };
                });

                // Sort by start date (descending, show upcoming/recent first)
                this.bookings = this.bookings.sort((a, b) => 
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                
                this.error = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('[Bookings] Fatal Error:', err);
                this.error = 'Failed to load bookings. Please try again later.';
                this.cdr.detectChanges();
            }
        });
    }

    private getBookingStatus(start: string, end: string): string {
        // This is now redundant as we use b.status from the API
        // But we might want to keep a helper for display formatting if needed
        return '';
    }

    getStatusClass(status: string): string {
        if (!status) return 'pending';
        return status.toLowerCase().replace('_', '-');
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    viewVehicle(vehicleId: string) {
        this.router.navigate(['/vehicle-details', vehicleId]);
    }
}
