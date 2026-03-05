import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { API_BASE_URL, VEHICLES_MY_CARS_PATH } from '../api.config';
import { Vehicle, CreateVehicleRequest, UpdatePriceRequest } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${API_BASE_URL}/vehicles`;

  constructor(private http: HttpClient) { }

  private parseVehicleList(response: any): Vehicle[] {
    if (response == null) return [];
    if (Array.isArray(response)) return response;
    const list =
      response.data ??
      response.content ??
      response.vehicles ??
      response.vehicleList ??
      response.result ??
      response.body ??
      response._embedded?.vehicles ??
      response._embedded?.vehicleList;
    return Array.isArray(list) ? list : [];
  }

  /**
   * Get all vehicles of the connected agency - GET /api/vehicles/my-cars
   */
  getMyVehicles(): Observable<Vehicle[]> {
    const url = `${this.apiUrl}/${VEHICLES_MY_CARS_PATH}`;
    console.log('[VehicleService] GET', url);
    return this.http.get<any>(url).pipe(
      timeout(30000),
      map(response => {
        const list = this.parseVehicleList(response);
        console.log('[VehicleService] Parsed', list?.length ?? 0, 'vehicles');
        return list;
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Get all available vehicles (public access)
   */
  getAvailableVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/available`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get vehicle details by ID
   */
  getVehicleById(id: string): Observable<Vehicle> {
    const url = `${this.apiUrl}/${id}`;
    console.log('[VehicleService] GET Detail Request:', url);
    return this.http.get<any>(url).pipe(
      timeout(15000),
      map(response => {
        console.log('[VehicleService] Raw Detail Response:', response);
        // Handle wrapped responses (e.g. { data: { ... } } or { vehicle: { ... } })
        if (response && response.id) return response;
        if (response && response.data && response.data.id) return response.data;
        if (response && response.vehicle && response.vehicle.id) return response.vehicle;
        return response;
      }),
      catchError(err => {
        console.error('[VehicleService] GET Detail Error:', err);
        return this.handleError(err);
      })
    );
  }

  /**
   * Create a new vehicle
   */
  createVehicle(vehicleData: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicleData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update vehicle price
   */
  updateVehiclePrice(id: string, priceData: UpdatePriceRequest): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.apiUrl}/${id}/price`, priceData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete a vehicle
   */
  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }



  /**
   * Handle HTTP errors - matches Swagger API responses
   */
  private handleError(error: any) {
    console.error('VehicleService Error:', error);
    let errorMessage = 'An error occurred while processing your request.';

    if (error?.name === 'TimeoutError' || error?.message?.includes('Timeout')) {
      errorMessage = 'Request timed out. The server may be slow or unavailable.';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to the vehicle service. Please check your internet connection.';
    } else if (error.status === 401) {
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'This vehicle does not belong to your agency.';
    } else if (error.status === 404) {
      errorMessage = 'Vehicle not found.';
    } else if (error.status === 409) {
      errorMessage = 'Registration number (matricule) already exists.';
    } else if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      } else if (typeof error.error === 'object') {
        const messages = Object.values(error.error);
        if (messages.length > 0) errorMessage = messages.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => errorMessage);
  }
}