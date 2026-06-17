import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { CertificateApi } from './certificate.api';
import { CertificateDto } from '../models/certificate.dto';
import { ApiResponse } from '../../../core/models/api-response.model';

const BASE = '/api/v1';

const makeCertDto = (overrides: Partial<CertificateDto> = {}): CertificateDto => ({
  id: 'cert-1',
  patientId: 'patient-1',
  professionalId: null,
  title: 'Laserterapia',
  certificateType: 'Extensão',
  content: null,
  issuedAt: null,
  storedFileId: null,
  active: true,
  revokedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

function wrap<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

describe('CertificateApi', () => {
  let api: CertificateApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CertificateApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CertificateApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll sends GET to /certificates and unwraps the page content', () => {
    const dtos = [makeCertDto()];
    api.getAll().subscribe((res) => {
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('cert-1');
    });

    const req = httpMock.expectOne((r) => r.url === `${BASE}/certificates`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('size')).toBe('200');
    req.flush(wrap({ content: dtos, totalElements: 1, totalPages: 1, number: 0, size: 200 }));
  });

  it('getById sends GET to /certificates/{id}', () => {
    api.getById('cert-1').subscribe((res) => {
      expect(res.id).toBe('cert-1');
    });

    const req = httpMock.expectOne(`${BASE}/certificates/cert-1`);
    expect(req.request.method).toBe('GET');
    req.flush(wrap(makeCertDto()));
  });

  it('create sends POST to /certificates with body', () => {
    const createDto = { title: 'Novo', certificateType: 'Extensão' };
    api.create(createDto).subscribe((res) => {
      expect(res.id).toBe('cert-1');
    });

    const req = httpMock.expectOne(`${BASE}/certificates`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject(createDto);
    req.flush(wrap(makeCertDto()));
  });

  it('update sends PUT to /certificates/{id} with body', () => {
    const updateDto = { title: 'Atualizado', certificateType: 'Extensão' };
    api.update('cert-1', updateDto).subscribe((res) => {
      expect(res.id).toBe('cert-1');
    });

    const req = httpMock.expectOne(`${BASE}/certificates/cert-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toMatchObject(updateDto);
    req.flush(wrap(makeCertDto({ title: 'Atualizado' })));
  });

  it('delete sends DELETE to /certificates/{id}', () => {
    let completed = false;
    api.delete('cert-1').subscribe(() => (completed = true));

    const req = httpMock.expectOne(`${BASE}/certificates/cert-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBe(true);
  });

  it('propagates HTTP errors as thrown Errors', () => {
    let errorMsg = '';
    api.getById('bad-id').subscribe({
      error: (err: Error) => (errorMsg = err.message),
    });

    const req = httpMock.expectOne(`${BASE}/certificates/bad-id`);
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    expect(errorMsg).toBeTruthy();
  });
});
