export type UnavailabilityReason = 'BOOKED' | 'MAINTENANCE';

export interface Unavailability {
    id: string;         // Always returned by the API
    vehicleId: string;
    startDate: string;  // ISO date YYYY-MM-DD
    endDate: string;    // ISO date YYYY-MM-DD
    reason: UnavailabilityReason;
}

export interface UnavailabilityResponse {
    id: string;
    vehicleId: string;
    startDate: string;
    endDate: string;
    reason: string;
}

export interface BlockDatesRequest {
    startDate: string;
    endDate: string;
    reason: UnavailabilityReason;
}

export interface AvailabilityCheckResponse {
    available: boolean;
}
