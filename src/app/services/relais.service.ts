import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PointDeRelais } from '../models/relais.model';

@Injectable({
    providedIn: 'root'
})
export class RelaisService {
    private readonly STORAGE_KEY = 'points_de_relais';

    constructor() { }

    private getStoredPoints(): PointDeRelais[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private savePoints(points: PointDeRelais[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(points));
    }

    /**
     * Get all points de relais
     */
    getPoints(): Observable<PointDeRelais[]> {
        return of(this.getStoredPoints()).pipe(delay(500));
    }

    /**
     * Add a new point de relais
     */
    addPoint(point: Omit<PointDeRelais, 'id' | 'createdAt'>): Observable<PointDeRelais> {
        const points = this.getStoredPoints();
        const newPoint: PointDeRelais = {
            ...point,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString()
        };
        points.push(newPoint);
        this.savePoints(points);
        return of(newPoint).pipe(delay(500));
    }

    /**
     * Delete a point de relais
     */
    deletePoint(id: string): Observable<void> {
        let points = this.getStoredPoints();
        points = points.filter(p => p.id !== id);
        this.savePoints(points);
        return of(void 0).pipe(delay(500));
    }
}
