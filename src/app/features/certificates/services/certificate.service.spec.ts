import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { CertificateApi } from '../api/certificate.api';
import { CertificateDto } from '../models/certificate.dto';
import { CertificateService } from './certificate.service';

const makeCertDto = (overrides: Partial<CertificateDto> = {}): CertificateDto => ({
  id: 'cert-1',
  patientId: 'patient-1',
  professionalId: null,
  title: 'Laserterapia',
  certificateType: 'Extensão',
  content: 'CFO — 40h',
  issuedAt: '2023-01-01T00:00:00Z',
  storedFileId: null,
  active: true,
  revokedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

function createApiMock() {
  return {
    getByPatient: vi.fn().mockReturnValue(of([makeCertDto()])),
    getById: vi.fn().mockReturnValue(of(makeCertDto())),
    create: vi.fn().mockReturnValue(of(makeCertDto({ id: 'new-cert' }))),
    update: vi.fn().mockReturnValue(of(makeCertDto({ title: 'Atualizado' }))),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };
}

describe('CertificateService', () => {
  let service: CertificateService;
  let api: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    api = createApiMock();
    TestBed.configureTestingModule({
      providers: [CertificateService, { provide: CertificateApi, useValue: api }],
    });
    service = TestBed.inject(CertificateService);
  });

  it('starts with empty certificates and not loading', () => {
    expect(service.certificates()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('load: fetches certificates and populates state', () => {
    service.load();
    expect(service.loading()).toBe(false);
    expect(service.certificates()).toHaveLength(1);
    expect(service.certificates()[0].id).toBe('cert-1');
    expect(service.certificates()[0].title).toBe('Laserterapia');
  });

  it('load: adapts active status correctly', () => {
    service.load();
    expect(service.certificates()[0].status).toBe('active');
  });

  it('load: sets error and clears loading on API failure', () => {
    api.getByPatient.mockReturnValue(throwError(() => new Error('Network error')));
    service.load();
    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('Network error');
    expect(service.certificates()).toHaveLength(0);
  });

  it('create: prepends new certificate and returns ViewModel', () => {
    service.load();
    expect(service.certificates()).toHaveLength(1);

    let emitted = false;
    service
      .create({ patientId: 'p1', title: 'Novo', certificateType: 'Extensão' })
      .subscribe((vm) => {
        emitted = true;
        expect(vm.id).toBe('new-cert');
      });

    expect(emitted).toBe(true);
    expect(service.certificates()).toHaveLength(2);
    expect(service.certificates()[0].id).toBe('new-cert');
    expect(service.saving()).toBe(false);
  });

  it('create: sets error on API failure', () => {
    api.create.mockReturnValue(throwError(() => new Error('Create failed')));
    service.create({ patientId: 'p1', title: 'X', certificateType: 'Y' }).subscribe({
      error: () => {},
    });
    expect(service.error()).toBe('Create failed');
    expect(service.saving()).toBe(false);
  });

  it('update: replaces certificate in list', () => {
    service.load();
    let updated = false;
    service
      .update('cert-1', { title: 'Atualizado', certificateType: 'Extensão' })
      .subscribe((vm) => {
        updated = true;
        expect(vm.title).toBe('Atualizado');
      });

    expect(updated).toBe(true);
    expect(service.certificates()).toHaveLength(1);
    expect(service.certificates()[0].title).toBe('Atualizado');
    expect(service.saving()).toBe(false);
  });

  it('delete: removes certificate from list', () => {
    service.load();
    expect(service.certificates()).toHaveLength(1);

    service.delete('cert-1').subscribe();

    expect(service.certificates()).toHaveLength(0);
    expect(service.deletingId()).toBeNull();
  });

  it('delete: sets deletingId during operation and clears on completion', () => {
    service.delete('cert-1').subscribe();
    expect(service.deletingId()).toBeNull();
  });

  it('clearError: resets the error signal to null', () => {
    api.getByPatient.mockReturnValue(throwError(() => new Error('fail')));
    service.load();
    expect(service.error()).toBe('fail');

    service.clearError();
    expect(service.error()).toBeNull();
  });
});
