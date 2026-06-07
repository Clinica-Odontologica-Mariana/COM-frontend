import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'access_token_expiry';

const KEYCLOAK_TOKEN_URL = '/keycloak/realms/rest-ms/protocol/openid-connect/token';
const CLIENT_ID = 'rest-ms-api';
const CLIENT_SECRET = 'rest-ms-api-secret';

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

  login(username: string, password: string): Observable<KeycloakTokenResponse> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', CLIENT_ID)
      .set('client_secret', CLIENT_SECRET)
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<KeycloakTokenResponse>(KEYCLOAK_TOKEN_URL, body.toString(), { headers }).pipe(
      tap((res) => this.storeToken(res)),
    );
  }

  initDevSession(): Observable<KeycloakTokenResponse | null> {
    if (!isPlatformBrowser(this.platformId)) return of(null);
    if (this.isTokenValid()) return of(null);
    return this.login('api-admin', 'admin123').pipe(
      catchError(() => of(null)),
    );
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  private storeToken(res: KeycloakTokenResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + res.expires_in * 1000));
  }
}
