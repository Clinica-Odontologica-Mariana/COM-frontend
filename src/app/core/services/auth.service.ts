import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'access_token_expiry';

const AUTH_LOGIN_URL = '/api/v1/auth/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token || !expiry) return false;
    return Date.now() < Number(expiry);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { username, password };
    return this.http
      .post<LoginResponse>(AUTH_LOGIN_URL, credentials)
      .pipe(tap((res) => this.storeToken(res)));
  }

  initDevSession(): Observable<LoginResponse | null> {
    if (!isPlatformBrowser(this.platformId)) return of(null);
    if (this.isTokenValid()) return of(null);
    return this.login('api-admin', 'admin123').pipe(catchError(() => of(null)));
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  private storeToken(res: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + res.expires_in * 1000));
  }
}
