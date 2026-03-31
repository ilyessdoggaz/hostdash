import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-car-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="close()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Confirm Vehicle Details</h3>
          <button class="close-btn" (click)="close()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="confirmation-message">
            <p>Please review the vehicle information before creating:</p>
          </div>
          
          <div class="vehicle-details">
            <div class="detail-row">
              <span class="label">Brand:</span>
              <span class="value">{{vehicleData?.brand}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Model:</span>
              <span class="value">{{vehicleData?.model}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Matricule:</span>
              <span class="value">{{vehicleData?.matricule}}</span>
            </div>
            <div class="detail-row">
              <span class="label">VIN Code:</span>
              <span class="value">{{vehicleData?.vincode}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Year:</span>
              <span class="value">{{vehicleData?.year}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Category:</span>
              <span class="value">{{vehicleData?.category}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fuel Type:</span>
              <span class="value">{{vehicleData?.fuelType}}</span>
            </div>
            <div class="detail-row">
              <span class="label">Price per Day:</span>
              <span class="value price">{{vehicleData?.pricePerDay}} DT</span>
            </div>
          </div>
          
          <div class="images-preview" *ngIf="images.length > 0">
            <h4>Images ({{images.length}})</h4>
            <div class="images-grid">
              <div class="image-preview" *ngFor="let image of images; let i = index">
                <img [src]="image" [alt]="'Vehicle image ' + (i+1)">
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" (click)="close()" [disabled]="submitting">Back to Edit</button>
          <button class="confirm-btn" (click)="confirm()" [disabled]="submitting">
            <span *ngIf="submitting" class="material-icons spinner">autorenew</span>
            {{ submitting ? 'Creating...' : 'Confirm & Create' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .dialog-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .dialog-header {
      padding: 24px 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .dialog-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }
    
    .close-btn {
      background: none;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: #f3f4f6;
      color: #111827;
    }
    
    .dialog-body {
      padding: 24px;
    }
    
    .confirmation-message {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    
    .confirmation-message p {
      margin: 0;
      color: #1e40af;
      font-weight: 500;
    }
    
    .vehicle-details {
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 600;
      color: #374151;
    }
    
    .value {
      font-weight: 500;
      color: #111827;
    }
    
    .value.price {
      color: #4f46e5;
      font-weight: 700;
      font-size: 1.1rem;
    }
    
    .images-preview h4 {
      margin: 0 0 16px 0;
      color: #111827;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .images-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    
    .image-preview {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
    }
    
    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .dialog-footer {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
    }
    
    .cancel-btn, .confirm-btn {
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .cancel-btn {
      background: #f3f4f6;
      color: #374151;
    }
    
    .cancel-btn:hover:not(:disabled) {
      background: #e5e7eb;
    }
    
    .confirm-btn {
      background: #4f46e5;
      color: white;
    }
    
    .confirm-btn:hover:not(:disabled) {
      background: #4338ca;
      transform: translateY(-1px);
    }
    
    .cancel-btn:disabled, .confirm-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .spinner {
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 640px) {
      .images-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class CarConfirmationDialog {
  @Input() isOpen = false;
  @Input() vehicleData: any = null;
  @Input() images: string[] = [];
  @Input() submitting = false;
  
  @Output() closeDialog = new EventEmitter<void>();
  @Output() confirmCreation = new EventEmitter<void>();
  
  close() {
    this.closeDialog.emit();
  }
  
  confirm() {
    this.confirmCreation.emit();
  }
}