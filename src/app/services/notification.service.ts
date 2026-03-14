import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: NotificationType;
}

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private confirm$ = new Subject<ConfirmData | null>();

  private toastId = 0;

  constructor() {}

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  getConfirm(): Observable<ConfirmData | null> {
    return this.confirm$.asObservable();
  }

  showToast(message: string, type: NotificationType = 'success', duration = 4000) {
    const id = this.toastId++;
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, { id, message, type }]);

    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  confirm(title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirm$.next({ title, message, confirmText, cancelText, resolve });
    });
  }

  closeConfirm(value: boolean, resolve: (v: boolean) => void) {
    this.confirm$.next(null);
    resolve(value);
  }

  private removeToast(id: number) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }
}
