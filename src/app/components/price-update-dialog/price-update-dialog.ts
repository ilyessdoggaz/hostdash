import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-update-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="close()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Update Price</h3>
          <button class="close-btn" (click)="close()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="price-display">
            <label>Current Price</label>
            <div class="current-price">
              <span class="amount">{{currentPrice}} DT</span>
              <span class="period">/ day</span>
            </div>
          </div>
          
          <div class="input-group">
            <label for="newPrice">New Price (DT)</label>
            <input 
              id="newPrice" 
              type="number" 
              [(ngModel)]="newPrice" 
              placeholder="Enter new price"
              min="1"
              (keydown.enter)="confirmUpdate()"
              #priceInput
            >
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" (click)="close()" [disabled]="submitting">Cancel</button>
          <button 
            class="update-btn" 
            (click)="confirmUpdate()" 
            [disabled]="submitting || !newPrice || newPrice <= 0 || newPrice === currentPrice">
            <span *ngIf="submitting" class="material-icons spinner">autorenew</span>
            {{ submitting ? 'Updating...' : 'Update Price' }}
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
    
    .price-display {
      margin-bottom: 24px;
    }
    
    .price-display label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    
    .current-price {
      display: flex;
      align-items: baseline;
      gap: 4px;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    
    .amount {
      font-size: 1.5rem;
      font-weight: 800;
      color: #111827;
    }
    
    .period {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .input-group {
      margin-bottom: 0;
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
    
    .cancel-btn:hover:not(:disabled) {
      background: #e5e7eb;
    }
    
    .update-btn {
      background: #4f46e5;
      color: white;
    }
    
    .update-btn:hover:not(:disabled) {
      background: #4338ca;
      transform: translateY(-1px);
    }
    
    .cancel-btn:disabled, .update-btn:disabled {
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
  `]
})
export class PriceUpdateDialog {
  @Input() isOpen = false;
  @Input() currentPrice: number = 0;
  @Input() submitting = false;
  
  @Output() closeDialog = new EventEmitter<void>();
  @Output() priceUpdate = new EventEmitter<number>();
  
  newPrice: number | null = null;
  
  close() {
    this.closeDialog.emit();
    this.newPrice = null;
  }
  
  confirmUpdate() {
    if (this.newPrice && this.newPrice > 0 && this.newPrice !== this.currentPrice) {
      this.priceUpdate.emit(this.newPrice);
    }
  }
}