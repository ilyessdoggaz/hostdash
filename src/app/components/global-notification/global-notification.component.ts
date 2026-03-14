import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast, ConfirmData } from '../../services/notification.service';

@Component({
  selector: 'app-global-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Toasts Container -->
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async" 
           class="toast" 
           [class.success]="toast.type === 'success'"
           [class.error]="toast.type === 'error'"
           [class.warning]="toast.type === 'warning'"
           [class.info]="toast.type === 'info'">
        <span class="material-icons toast-icon">
          {{ getIcon(toast.type) }}
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" *ngIf="confirmData$ | async as data" (click)="onConfirm(false, data)">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ data.title }}</h3>
          <button class="close-btn" (click)="onConfirm(false, data)">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ data.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="onConfirm(false, data)">{{ data.cancelText }}</button>
          <button class="confirm-btn" (click)="onConfirm(true, data)">{{ data.confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      background: white;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 450px;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid #4F46E5;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast.success { border-left-color: #10B981; }
    .toast.error { border-left-color: #EF4444; }
    .toast.warning { border-left-color: #F59E0B; }
    .toast.info { border-left-color: #3B82F6; }

    .toast-icon { font-size: 20px; }
    .success .toast-icon { color: #10B981; }
    .error .toast-icon { color: #EF4444; }
    .warning .toast-icon { color: #F59E0B; }
    .info .toast-icon { color: #3B82F6; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes zoomIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      padding: 24px 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #9CA3AF;
      transition: color 0.2s;
    }

    .close-btn:hover { color: #111827; }

    .modal-body {
      padding: 0 24px 24px;
    }

    .modal-body p {
      margin: 0;
      color: #4B5563;
      line-height: 1.6;
    }

    .modal-footer {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
    }

    .cancel-btn, .confirm-btn {
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .cancel-btn {
      background: #F3F4F6;
      color: #374151;
    }

    .cancel-btn:hover { background: #E5E7EB; }

    .confirm-btn {
      background: #4F46E5;
      color: white;
    }

    .confirm-btn:hover { 
      background: #4338CA;
      transform: translateY(-1px);
    }
  `]
})
export class GlobalNotificationComponent implements OnInit {
  private notificationService = inject(NotificationService);
  
  toasts$ = this.notificationService.getToasts();
  confirmData$ = this.notificationService.getConfirm();

  ngOnInit() {}

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  onConfirm(value: boolean, data: ConfirmData) {
    this.notificationService.closeConfirm(value, data.resolve);
  }
}
