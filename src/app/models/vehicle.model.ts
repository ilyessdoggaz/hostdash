export interface Agency {
  id: string;
  agencyName: string;
  logo: string;
}

export interface Vehicle {
  id: string;
  agence: Agency;
  vincode: string;
  matricule: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  category: string;
  isArchived: boolean;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  images: string[];
  fuelType: string;
  seatingCapacity?: number;
  transmission?: 'MANUAL' | 'AUTOMATIC';
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  lastPing?: string;
  relayPointId?: string;
  deviceCode?: string;
}

export interface CreateVehicleRequest {
  vincode: string;
  matricule: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  category: string;
  fuelType: string;
  seatingCapacity: number;
  transmission: 'MANUAL' | 'AUTOMATIC';
  images: string[];
  deviceCode?: string;
}

export interface UpdatePriceRequest {
  pricePerDay: number;
}

export interface VehicleApiResponse {
  success: boolean;
  data?: Vehicle | Vehicle[];
  message?: string;
}