import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL, IOT_PINGS_PATH, IOT_LAST_PATH, IOT_HISTORY_PATH } from '../api.config';

export interface VehiclePing {
  id?: string;
  vincode: string;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class IotService {
  private apiUrl = `${API_BASE_URL}/${IOT_PINGS_PATH}`;

  constructor(private http: HttpClient) { }

  /**
   * Get the last known position of a vehicle - GET /api/iot/pings/{vincode}/last
   */
  getLastPosition(vincode: string): Observable<VehiclePing> {
    return this.http.get<VehiclePing>(`${this.apiUrl}/${vincode}/${IOT_LAST_PATH}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get position history for a vehicle - GET /api/iot/pings/{vincode}/history
   */
  getPositionHistory(vincode: string): Observable<VehiclePing[]> {
    return this.http.get<VehiclePing[]>(`${this.apiUrl}/${vincode}/${IOT_HISTORY_PATH}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Record a new GPS ping - POST /api/iot/pings
   */
  recordPing(ping: Partial<VehiclePing>): Observable<VehiclePing> {
    return this.http.post<VehiclePing>(this.apiUrl, ping)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('IotService Error:', error);
    let errorMessage = 'An error occurred while fetching tracking data.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => errorMessage);
  }
}
