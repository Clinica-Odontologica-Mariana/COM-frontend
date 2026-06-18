import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { AuthService, LoginResponse } from './auth.service';

const mockResponse: LoginResponse = {
  accessToken: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
  refreshExpiresIn: 86400,
  tokenType: 'Bearer',
  scope: 'openid profile',
};

const mockApiResponse = {
  success: true,
  data: mockResponse,
  error: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('envia POST para /api/v1/auth/login com username e password', () => {
      service.login('user@test.com', 'senha123').subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'user@test.com', password: 'senha123' });
      req.flush(mockApiResponse);
    });

    it('armazena access_token no localStorage após login bem-sucedido', () => {
      service.login('user@test.com', 'senha123').subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockApiResponse);

      expect(localStorage.getItem('access_token')).toBe('mock-jwt-token');
    });

    it('armazena access_token_expiry correto no localStorage', () => {
      const before = Date.now();
      service.login('user@test.com', 'senha123').subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockApiResponse);

      const expiry = Number(localStorage.getItem('access_token_expiry'));
      expect(expiry).toBeGreaterThanOrEqual(before + 3600 * 1000);
    });

    it('retorna a LoginResponse emitida pelo backend', () => {
      let result: LoginResponse | undefined;
      service.login('user@test.com', 'senha123').subscribe((r) => (result = r));

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockApiResponse);

      expect(result).toEqual(mockResponse);
    });

    it('propaga erro quando o backend retorna 401', () => {
      let errorThrown = false;
      service.login('user@test.com', 'errada').subscribe({ error: () => (errorThrown = true) });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorThrown).toBe(true);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('isTokenValid()', () => {
    it('retorna false quando não há token armazenado', () => {
      expect(service.isTokenValid()).toBe(false);
    });

    it('retorna true quando token existe e não expirou', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('access_token_expiry', String(Date.now() + 60_000));

      expect(service.isTokenValid()).toBe(true);
    });

    it('retorna false quando token expirou', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('access_token_expiry', String(Date.now() - 1000));

      expect(service.isTokenValid()).toBe(false);
    });

    it('retorna false quando existe token mas não há expiry', () => {
      localStorage.setItem('access_token', 'token');

      expect(service.isTokenValid()).toBe(false);
    });
  });

  describe('getToken()', () => {
    it('retorna null quando não há token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('retorna o token armazenado', () => {
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('access_token_expiry', String(Date.now() + 60_000));
      expect(service.getToken()).toBe('stored-token');
    });
  });

  describe('logout()', () => {
    it('remove access_token e access_token_expiry do localStorage', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh-token');
      localStorage.setItem('access_token_expiry', String(Date.now() + 60_000));

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('access_token_expiry')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('initDevSession()', () => {
    it('não chama login quando token já é válido', () => {
      localStorage.setItem('access_token', 'valid-token');
      localStorage.setItem('access_token_expiry', String(Date.now() + 60_000));

      service.initDevSession().subscribe();

      httpMock.expectNone('/api/v1/auth/login');
    });

    it('chama login com credenciais de dev quando token não é válido', () => {
      service.initDevSession().subscribe();

      const req = httpMock.expectOne('/api/v1/auth/login');
      expect(req.request.body).toEqual({ username: 'api-admin', password: 'api-admin123' });
      req.flush(mockApiResponse);
    });

    it('emite null sem erro quando login falha (catchError)', () => {
      let result: unknown = 'not-set';
      service.initDevSession().subscribe((r) => (result = r));

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
    });
  });
});
