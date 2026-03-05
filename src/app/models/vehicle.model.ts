export interface Agency {
  id: string;
  name: string;
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
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
  images: string[];
  fuelType: string;
  createdAt: string;
  updatedAt: string;
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
  images: string[];
}

export interface UpdatePriceRequest {
  pricePerDay: number;
}

export interface VehicleApiResponse {
  success: boolean;
  data?: Vehicle | Vehicle[];
  message?: string;
}