import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { Booking } from '../models/booking.model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = `${API_BASE_URL}/bookings`;

    constructor(private http: HttpClient) { }

    /**
     * Get booking list for the authenticated user - GET /api/bookings/me
     */
    getMyBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/me`)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: any) {
        console.error('BookingService Error:', error);
        let errorMessage = 'An error occurred while managing bookings.';

        if (error.status === 401) {
            errorMessage = 'Session expired. Please log in again.';
        } else if (error.status === 403) {
            errorMessage = 'Access denied.';
        } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        }

        return throwError(() => errorMessage);
    }
}
