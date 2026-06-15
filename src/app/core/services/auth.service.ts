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
  refreshToken?: string;
  refreshExpiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export interface CurrentUser {
  subject: string;
  username: string;
  email: string | null;
  roles: string[];
  claims: Record<string, unknown>;
}

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'access_token_expiry';
const DEV_USERNAME = 'api-admin';
const DEV_PASSWORD = 'api-admin123';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = inject(API_BASE_URL);

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    if (!this.isTokenValid()) {
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
    return this.http.post<AuthLoginPayload>(`${this.baseUrl}/auth/login`, credentials).pipe(
      map((res) => this.normalizeLoginResponse(res)),
      tap((res) => this.storeToken(res)),
    );
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http
      .get<ApiResponse<CurrentUser>>(`${this.baseUrl}/auth/me`)
      .pipe(map((response) => response.data));
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
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  private normalizeLoginResponse(res: AuthLoginPayload): LoginResponse {
    const data = 'success' in res ? res.data : res;
    const accessToken = data.accessToken ?? data.access_token;
    const refreshToken = data.refreshToken ?? data.refresh_token;
    const expiresIn = data.expiresIn ?? data.expires_in;

    if (!accessToken || !expiresIn) {
      throw new Error('Resposta de autenticação inválida.');
    }

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private storeToken(res: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    }
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + res.expiresIn * 1000));
  }
}

type AuthLoginPayload = ApiResponse<AuthTokenDto> | AuthTokenDto;

interface AuthTokenDto {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
}
