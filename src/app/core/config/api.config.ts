import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    __env?: {
      API_BASE_URL?: string;
    };
  }
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () =>
    typeof window !== 'undefined' ? window.__env?.API_BASE_URL?.trim() || '/api/v1' : '/api/v1',
});
