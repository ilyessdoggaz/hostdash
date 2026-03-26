export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS';

export interface Booking {
    id: string;
    vehicleId: string;
    renterId: string;
    agencyId: string;
    pickupRelayPointId: string;
    dropoffRelayPointId: string;
    startDate: string;  // ISO string
    endDate: string;    // ISO string
    totalPrice: number;
    status: BookingStatus;
}
