export type UnavailabilityReason = 'BOOKED' | 'MAINTENANCE';

export interface Unavailability {
    id?: string;
    vehicleId: string;
    startDate: string; // ISO date YYYY-MM-DD
    endDate: string;   // ISO date YYYY-MM-DD
    reason: UnavailabilityReason;
}

export interface UnavailabilityResponse {
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
