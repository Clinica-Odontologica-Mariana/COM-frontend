import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;

  readonly messages = signal<ToastMessage[]>([]);

  error(message: string): void {
    this.show(message, 'error');
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private show(message: string, type: ToastType): void {
    const toast: ToastMessage = {
      id: this.nextId++,
      message,
      type,
    };

    this.messages.update((messages) => [...messages, toast]);
    window.setTimeout(() => this.dismiss(toast.id), 5000);
  }
}
