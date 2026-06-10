import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  tokenType: string;
  scope: string;
}

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'access_token_expiry';
const DEV_USERNAME = 'api-admin';
const DEV_PASSWORD = 'api-admin123';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly platformId = inject(PLATFORM_ID);

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));

    return Boolean(token && expiry && Date.now() < expiry);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { username, password };

    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiBaseUrl}/auth/login`, credentials)
      .pipe(
        map((response) => response.data),
        tap((response) => this.storeToken(response)),
      );
  }

  initDevSession(): Observable<LoginResponse | null> {
    if (!isPlatformBrowser(this.platformId) || this.isTokenValid()) {
      return of(null);
    }

    return this.login(DEV_USERNAME, DEV_PASSWORD).pipe(catchError(() => of(null)));
  }

  ensureDevSession(): Observable<void> {
    if (!isPlatformBrowser(this.platformId) || this.isTokenValid()) {
      return of(void 0);
    }

    return this.login(DEV_USERNAME, DEV_PASSWORD).pipe(map(() => void 0));
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  private storeToken(response: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + response.expiresIn * 1000));
  }
}
