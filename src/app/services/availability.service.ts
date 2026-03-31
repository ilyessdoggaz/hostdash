import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { 
    Unavailability, 
    BlockDatesRequest, 
    AvailabilityCheckResponse 
} from '../models/availability.model';

@Injectable({
    providedIn: 'root'
})
export class AvailabilityService {
    private apiUrl = `${API_BASE_URL}/vehicles`;

    constructor(private http: HttpClient) { }

    /**
     * Get upcoming unavailabilities for a vehicle
     */
    getUnavailabilities(vehicleId: string): Observable<Unavailability[]> {
        return this.http.get<Unavailability[]>(`${this.apiUrl}/${vehicleId}/availability`)
            .pipe(catchError(this.handleError));
    }

    /**
     * Check if a vehicle is available for a date range
     */
    checkAvailability(vehicleId: string, startDate: string, endDate: string): Observable<AvailabilityCheckResponse> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        
        return this.http.get<AvailabilityCheckResponse>(`${this.apiUrl}/${vehicleId}/availability/check`, { params })
            .pipe(catchError(this.handleError));
    }

    /**
     * Block a date range for a vehicle
     */
    blockDates(vehicleId: string, request: BlockDatesRequest): Observable<Unavailability> {
        return this.http.post<Unavailability>(`${this.apiUrl}/${vehicleId}/availability/block`, request)
            .pipe(catchError(this.handleError));
    }

    /**
     * Unblock a date range or specific unavailability
     */
    unblockDates(vehicleId: string, params: { startDate?: string, endDate?: string, unavailabilityId?: string }): Observable<void> {
        let httpParams = new HttpParams();
        if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
        if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
        if (params.unavailabilityId) httpParams = httpParams.set('unavailabilityId', params.unavailabilityId);

        return this.http.delete<void>(`${this.apiUrl}/${vehicleId}/availability/unblock`, { params: httpParams })
            .pipe(catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('AvailabilityService Error:', error);
        let errorMessage = 'An error occurred while managing availability.';

        if (error.status === 409) {
            errorMessage = 'The vehicle is already blocked or booked during this period.';
        } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        }

        return throwError(() => errorMessage);
    }
}
