import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PointDeRelais } from '../models/relais.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
    providedIn: 'root'
})
export class RelaisService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${API_BASE_URL}/relays`;

    /** Extract agencyId from token */
    private getAgencyIdFromToken(): string | null {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload.agencyId || payload.agenceId || payload.agency_id || null;
        } catch { return null; }
    }

    /** Normalize point to ensure `id` exists */
    private normalizePoint(p: any): PointDeRelais {
        if (!p) return p as PointDeRelais;
        const raw = p.data || p.relay || p.relayPoint || p;
        const id = raw._id?.toString() || raw.id?.toString() || '';
        return {
            ...raw,
            id
        } as PointDeRelais;
    }

    /**
     * Get all points de relais
     */
    getPoints(): Observable<PointDeRelais[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => {
                const list = Array.isArray(res) ? res : (res.data || res.content || res.relays || []);
                return list.map((p: any) => this.normalizePoint(p));
            }),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * Add a new point de relais
     */
    addPoint(point: Omit<PointDeRelais, 'id' | 'active' | 'agencyId'>): Observable<PointDeRelais> {
        const agencyId = this.getAgencyIdFromToken();
        const payload = agencyId ? { ...point, agencyId } : point;
        return this.http.post<any>(this.apiUrl, payload).pipe(
            map(res => this.normalizePoint(res)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * Update a point de relais
     */
    updatePoint(id: string, point: Omit<PointDeRelais, 'id' | 'active' | 'agencyId'>): Observable<PointDeRelais> {
        const url = `${this.apiUrl}/${id}`;
        const agencyId = this.getAgencyIdFromToken();
        const payload = agencyId ? { ...point, agencyId } : point;
        return this.http.put<any>(url, payload).pipe(
            map(res => this.normalizePoint(res)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * Deactivate a point de relais
     */
    deactivatePoint(id: string): Observable<PointDeRelais> {
        const url = `${this.apiUrl}/${id}/deactivate`;
        // Sending an empty object {} instead of null is safer for some backend parsers
        return this.http.patch<any>(url, {}, { headers: { 'Content-Type': 'application/json' } }).pipe(
            map(res => this.normalizePoint(res)),
            map(point => ({ ...point, id, active: false })), // Ensure ID and Status are preserved
            catchError(err => this.handleError(err))
        );
    }

    private handleError(error: any) {
        console.error('[RelaisService] Error:', error);
        let errorMessage = 'An error occurred while processing your request.';

        if (error.status === 0) {
            errorMessage = 'Cannot connect to the relay service. Please check your connection.';
        } else if (error.status === 401) {
            errorMessage = 'Session expired. Please log in again.';
        } else if (error.status === 403) {
            errorMessage = 'You do not have permission to modify this point.';
        } else if (error.status === 404) {
            errorMessage = 'Relay point not found.';
        } else if (error.error) {
            if (typeof error.error === 'string') {
                errorMessage = error.error;
            } else if (error.error.message) {
                errorMessage = error.error.message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return throwError(() => errorMessage);
    }
}
