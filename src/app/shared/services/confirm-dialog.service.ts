import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmDialogState {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState | null>(null);

  confirm(message: string, title = 'Confirmar'): Observable<boolean> {
    const result$ = new Subject<boolean>();
    this.state.set({ title, message });
    this.pendingResult = result$;
    return result$.asObservable();
  }

  private pendingResult: Subject<boolean> | null = null;

  accept(): void {
    this.pendingResult?.next(true);
    this.pendingResult?.complete();
    this.pendingResult = null;
    this.state.set(null);
  }

  cancel(): void {
    this.pendingResult?.next(false);
    this.pendingResult?.complete();
    this.pendingResult = null;
    this.state.set(null);
  }
}
