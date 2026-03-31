import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-update-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="close()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Set Car Location</h3>
          <button class="close-btn" (click)="close()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <p class="helper-text">Set the coordinates for this car to show it on the map.</p>
          
          <div class="input-group">
            <label for="lat">Latitude</label>
            <input 
              id="lat" 
              type="number" 
              [(ngModel)]="lat" 
              placeholder="e.g. 33.8869"
              step="0.000001"
            >
          </div>
          
          <div class="input-group" style="margin-top: 16px;">
            <label for="lng">Longitude</label>
            <input 
              id="lng" 
              type="number" 
              [(ngModel)]="lng" 
              placeholder="e.g. 9.5375"
              step="0.000001"
            >
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" (click)="close()" [disabled]="submitting">Cancel</button>
          <button 
            class="update-btn" 
            (click)="confirmUpdate()" 
            [disabled]="submitting || !lat || !lng">
            <span *ngIf="submitting" class="material-icons spinner">autorenew</span>
            {{ submitting ? 'Updating...' : 'Pin to Map' }}
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
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
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
    
    .helper-text {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 16px;
    }
    
    .input-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    
    input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s;
      background: #fdfdfd;
    }
    
    input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
      background: white;
    }
    
    .dialog-footer {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
    }
    
    .cancel-btn, .update-btn {
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
    
    .update-btn {
      background: #3B82F6;
      color: white;
    }
    
    .update-btn:hover:not(:disabled) {
      background: #2563EB;
    }
    
    .spinner {
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LocationUpdateDialog {
  @Input() isOpen = false;
  @Input() submitting = false;
  
  @Output() closeDialog = new EventEmitter<void>();
  @Output() locationUpdate = new EventEmitter<{lat: number, lng: number}>();
  
  lat: number = 33.8869;
  lng: number = 9.5375;
  
  close() {
    this.closeDialog.emit();
  }
  
  confirmUpdate() {
    if (this.lat && this.lng) {
      this.locationUpdate.emit({lat: this.lat, lng: this.lng});
    }
  }
}
