import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adiciona Authorization: Bearer quando token está armazenado', () => {
    localStorage.setItem('access_token', 'my-jwt-token');

    http.get('/api/v1/patients/123').subscribe();

    const req = httpMock.expectOne('/api/v1/patients/123');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it('não adiciona header Authorization quando não há token', () => {
    http.get('/api/v1/patients/123').subscribe();

    const req = httpMock.expectOne('/api/v1/patients/123');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('adiciona Bearer token em requisições para Medical Records API', () => {
    localStorage.setItem('access_token', 'token-records');

    http.get('/api/v1/medical-records/r1').subscribe();

    const req = httpMock.expectOne('/api/v1/medical-records/r1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-records');
    req.flush({});
  });

  it('adiciona Bearer token em requisições para Patients API', () => {
    localStorage.setItem('access_token', 'token-patients');

    http.get('/api/v1/patients').subscribe();

    const req = httpMock.expectOne('/api/v1/patients');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-patients');
    req.flush([]);
  });

  it('adiciona Bearer token em requisições para Evolutions API', () => {
    localStorage.setItem('access_token', 'token-evolutions');

    http.get('/api/v1/evolutions').subscribe();

    const req = httpMock.expectOne('/api/v1/evolutions');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-evolutions');
    req.flush([]);
  });

  it('adiciona Bearer token em requisições para Attachments API', () => {
    localStorage.setItem('access_token', 'token-attachments');

    http.post('/api/v1/attachments', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/attachments');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-attachments');
    req.flush({});
  });

  it('não adiciona Bearer token na requisição de login', () => {
    localStorage.setItem('access_token', 'existing-token');

    http.post('/api/v1/auth/login', { username: 'u', password: 'p' }).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
