import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  private show(type: ToastType, message: string): void {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, message };
    this.messages.update((items) => [...items, toast]);
    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: number): void {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }
}
