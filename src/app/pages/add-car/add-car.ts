import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { CreateVehicleRequest, Vehicle } from '../../models/vehicle.model';
import { CarConfirmationDialog } from '../../components/car-confirmation-dialog/car-confirmation-dialog';

@Component({
    selector: 'app-add-car',
    standalone: true,
    imports: [CommonModule, FormsModule, CarConfirmationDialog],
    templateUrl: './add-car.html',
    styleUrl: './add-car.css'
})
export class AddCar implements OnInit {
    carInfo = {
        brand: '',
        model: '',
        matricule: '',
        vincode: '',
        year: new Date().getFullYear(),
        pricePerDay: 0,
        category: 'Compact',
        fuelType: 'Petrol',
        description: ''
    };

    selectedImages: string[] = [];
    isDragging = false;
    isSubmitting = false;
    error: string | null = null;

    isEditing = false;
    editingId: string | null = null;
    originalVehicle: Vehicle | null = null;
    
    // Confirmation dialog
    showConfirmation = false;
    pendingVehicleData: CreateVehicleRequest | null = null;

    fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
    categories = ['Compact', 'Sedan', 'SUV', 'Van', 'Luxury', 'Sports'];

    constructor(
        private router: Router,
        private vehicleService: VehicleService
    ) { }

    ngOnInit() {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state && navigation.extras.state['editVehicle']) {
            const vehicle = navigation.extras.state['editVehicle'] as Vehicle;
            this.isEditing = true;
            this.editingId = vehicle.id;
            this.originalVehicle = vehicle;
            
            this.carInfo = {
                brand: vehicle.brand,
                model: vehicle.model,
                matricule: vehicle.matricule,
                vincode: vehicle.vincode,
                year: vehicle.year,
                pricePerDay: vehicle.pricePerDay,
                category: vehicle.category,
                fuelType: vehicle.fuelType,
                description: ''
            };
            
            if (vehicle.images && vehicle.images.length > 0) {
                this.selectedImages = [...vehicle.images];
            }
        }
    }

    onFileChange(event: any) {
        const files = event.target.files;
        this.handleFiles(files);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.isDragging = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.isDragging = false;
        const files = event.dataTransfer?.files;
        if (files) {
            this.handleFiles(files);
        }
    }

    private handleFiles(files: FileList) {
        if (this.selectedImages.length + files.length > 5) {
            alert('You can only upload a maximum of 5 images.');
            return;
        }

        Array.from(files).forEach(file => {
            // For now, we'll convert to base64 data URLs
            // In production, you'd want to upload to a proper image service
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedImages.push(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    removeImage(index: number) {
        this.selectedImages.splice(index, 1);
    }

    onSubmit() {
        if (this.isSubmitting) return;
        
        // API does not support full vehicle update - only PATCH /price. Redirect to my-cars for price updates.
        if (this.isEditing && this.editingId) {
            this.error = 'Full vehicle editing is not supported. To update the price, go to My Cars and use the price edit button.';
            return;
        }
        
        // Validate required fields
        if (!this.carInfo.brand || !this.carInfo.model || !this.carInfo.matricule) {
            this.error = 'Please fill in all required fields (Brand, Model, Matricule)';
            return;
        }
        
        if (this.carInfo.pricePerDay <= 0) {
            this.error = 'Please enter a valid price per day';
            return;
        }
        
        if (this.selectedImages.length === 0) {
            if (!confirm('No images uploaded. Continue without images?')) {
                return;
            }
        }
        
        this.error = null;
        
        const vehicleData: CreateVehicleRequest = {
            brand: this.carInfo.brand,
            model: this.carInfo.model,
            matricule: this.carInfo.matricule,
            vincode: this.carInfo.vincode || `VIN${Date.now()}`,
            year: this.carInfo.year,
            pricePerDay: this.carInfo.pricePerDay,
            category: this.carInfo.category,
            fuelType: this.carInfo.fuelType,
            images: this.selectedImages.length > 0 ? this.selectedImages : []
        };
        
        this.pendingVehicleData = vehicleData;
        this.showConfirmation = true;
    }
    
    private createVehicle(vehicleData: CreateVehicleRequest) {
        this.isSubmitting = true;
        this.vehicleService.createVehicle(vehicleData)
            .subscribe({
                next: (vehicle) => {
                    this.isSubmitting = false;
                    this.showConfirmation = false;
                    this.pendingVehicleData = null;
                    alert(`${this.isEditing ? 'Vehicle updated' : 'Vehicle created'} successfully!`);
                    this.router.navigate(['/my-cars']);
                },
                error: (error) => {
                    this.isSubmitting = false;
                    this.error = error;
                    console.error('Error creating vehicle:', error);
                }
            });
    }
    
    // Confirmation dialog methods
    closeConfirmation() {
        this.showConfirmation = false;
        this.pendingVehicleData = null;
    }
    
    confirmCreation() {
        if (this.pendingVehicleData) {
            this.createVehicle(this.pendingVehicleData);
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
