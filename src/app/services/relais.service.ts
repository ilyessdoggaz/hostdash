import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PointDeRelais } from '../models/relais.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
    providedIn: 'root'
})
export class RelaisService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${API_BASE_URL}/relays`;

    /** Extracts the agencyId from the stored JWT token */
    private getAgencyIdFromToken(): string | null {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload.agencyId || payload.agenceId || payload.agency_id || null;
        } catch { return null; }
    }
    
    /**
     * Normalizes a point by ensuring it has an 'id' property (mapped from '_id' if necessary)
     * Always prefers _id (MongoDB ObjectId) if id is missing or falsy
     */
    private normalizePoint(p: any): PointDeRelais {
        if (!p) return p;
        const id = p._id?.toString() || p.id?.toString() || '';
        return {
            ...p,
            id
        };
    }

    /**
     * Get all points de relais
     */
    getPoints(): Observable<PointDeRelais[]> {
        console.log('[RelaisService] Fetching all points from:', this.apiUrl);
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => {
                const rawList = Array.isArray(res) ? res : (res.data || res.content || res.relays || []);
                console.log('[RelaisService] RAW first point from API:', rawList[0]); // diagnose agencyId
                const list = rawList.map((p: any) => this.normalizePoint(p));
                console.log('[RelaisService] Loaded and normalized', list.length, 'points. First point id:', list[0]?.id, 'agencyId:', list[0]?.agencyId);
                return list;
            }),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * Add a new point de relais
     */
    addPoint(point: { name: string; latitude: number; longitude: number; address: string }): Observable<PointDeRelais> {
        const agencyId = this.getAgencyIdFromToken();
        const body = agencyId ? { ...point, agencyId } : point;
        console.log('[RelaisService] Adding point with body:', body);
        return this.http.post<any>(this.apiUrl, body).pipe(
            map(res => this.normalizePoint(res.data || res.relay || res.relayPoint || res)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * Update a point de relais
     */
    updatePoint(id: string, point: { name: string; latitude: number; longitude: number; address: string }): Observable<PointDeRelais> {
        const url = `${this.apiUrl}/${id}`;
        const agencyId = this.getAgencyIdFromToken();
        const body = agencyId ? { ...point, agencyId } : point;
        console.log('[RelaisService] Updating point at:', url, 'with body:', body);
        return this.http.put<any>(url, body).pipe(
            tap(res => console.log('[RelaisService] Update raw response:', res)),
            map(res => {
                const raw = res?.data || res?.relay || res?.relayPoint || res;
                const normalized = this.normalizePoint(raw);
                if (!normalized?.id) {
                    return { id, ...point, active: true, agencyId: agencyId || '' } as PointDeRelais;
                }
                return normalized;
            }),
            catchError(err => {
                console.error('[RelaisService] PUT failed, trying PATCH for update:', err.status);
                return this.http.patch<any>(url, body).pipe(
                    tap(res => console.log('[RelaisService] PATCH update raw response:', res)),
                    map(res => {
                        const raw = res?.data || res?.relay || res?.relayPoint || res;
                        const normalized = this.normalizePoint(raw);
                        if (!normalized?.id) {
                            return { id, ...point, active: true, agencyId: agencyId || '' } as PointDeRelais;
                        }
                        return normalized;
                    }),
                    catchError(patchErr => this.handleError(patchErr))
                );
            })
        );
    }

    /**
     * Deactivate a point de relais
     * Tries multiple body shapes because the backend may expect { active: false },
     * { status: 'inactive' }, or an empty body depending on the API version.
     */
    deactivatePoint(id: string): Observable<PointDeRelais> {
        const url = `${this.apiUrl}/${id}/deactivate`;

        const normalizeResult = (res: any): PointDeRelais => {
            const raw = res?.data || res?.relay || res?.relayPoint || res;
            const normalized = this.normalizePoint(raw);
            if (!normalized || !normalized.id) {
                return { id, active: false } as any as PointDeRelais;
            }
            return { ...normalized, active: false };
        };

        // Attempt 1: PATCH with { active: false } body
        console.log('[RelaisService] PATCH deactivate attempt 1 — body: { active: false }');
        return this.http.patch<any>(url, { active: false }).pipe(
            tap(res => console.log('[RelaisService] Deactivate response:', res)),
            map(normalizeResult),
            catchError(err1 => {
                console.warn('[RelaisService] Attempt 1 failed (', err1.status, '), trying PATCH with { status: "inactive" }...');
                // Attempt 2: PATCH with { status: 'inactive' } body
                return this.http.patch<any>(url, { status: 'inactive' }).pipe(
                    tap(res => console.log('[RelaisService] Deactivate attempt 2 response:', res)),
                    map(normalizeResult),
                    catchError(err2 => {
                        console.warn('[RelaisService] Attempt 2 failed (', err2.status, '), trying PATCH with empty body...');
                        // Attempt 3: PATCH with empty body (original)
                        return this.http.patch<any>(url, {}).pipe(
                            tap(res => console.log('[RelaisService] Deactivate attempt 3 response:', res)),
                            map(normalizeResult),
                            catchError(err3 => this.handleError(err3))
                        );
                    })
                );
            })
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
