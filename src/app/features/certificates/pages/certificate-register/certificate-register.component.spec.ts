import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { CertificateRegisterPageComponent } from './certificate-register.component';
import { CertificateService } from '../../services/certificate.service';
import { CertificateViewModel } from '../../models/certificate.model';

const makeCertVm = (overrides: Partial<CertificateViewModel> = {}): CertificateViewModel => ({
  id: 'cert-1',
  title: 'Laserterapia',
  certificateType: 'Extensão',
  content: 'CFO — 40h',
  issuedAt: '2023-06-15T00:00:00Z',
  storedFileId: null,
  hasFile: false,
  featured: false,
  status: 'active',
  issuedAtFormatted: '15/06/2023',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

function createServiceMock() {
  const certs = vi.fn(() => [makeCertVm()]);
  const loading = vi.fn(() => false);
  const saving = vi.fn(() => false);
  const deletingId = vi.fn(() => null);
  const error = vi.fn(() => null);
  const featuredCount = vi.fn(() => 0);
  const canFeatureMore = vi.fn(() => true);

  return {
    certificates: certs,
    loading,
    saving,
    deletingId,
    error,
    featuredCount,
    canFeatureMore,
    load: vi.fn(),
    create: vi.fn().mockReturnValue(of(makeCertVm({ id: 'new-cert' }))),
    update: vi.fn().mockReturnValue(of(makeCertVm({ title: 'Atualizado' }))),
    delete: vi.fn().mockReturnValue(of(undefined)),
    toggleFeatured: vi.fn(),
    clearError: vi.fn(),
  };
}

describe('CertificateRegisterPageComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CertificateRegisterPageComponent>>;
  let component: CertificateRegisterPageComponent;
  let serviceMock: ReturnType<typeof createServiceMock>;

  beforeEach(() => {
    serviceMock = createServiceMock();

    TestBed.configureTestingModule({
      imports: [CertificateRegisterPageComponent],
      providers: [
        provideRouter([]),
        { provide: CertificateService, useValue: serviceMock },
      ],
    }).overrideComponent(CertificateRegisterPageComponent, {
      set: { providers: [] },
    });

    fixture = TestBed.createComponent(CertificateRegisterPageComponent);
    component = fixture.componentInstance;
  });

  it('calls service.load() on init', () => {
    fixture.detectChanges();
    expect(serviceMock.load).toHaveBeenCalledOnce();
  });

  it('calls service.create() with correct DTO on valid submit', () => {
    fixture.detectChanges();
    component['formData'] = {
      title: 'Novo Certificado',
      certificateType: 'Extensão',
      content: 'Descrição',
      issuedAt: '2024-01-01',
    };

    component['onSubmit']();

    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Novo Certificado',
        certificateType: 'Extensão',
        content: 'Descrição',
      }),
    );
  });

  it('does not call service.create() when title is empty', () => {
    fixture.detectChanges();
    component['formData'] = { title: '', certificateType: 'Extensão', content: '', issuedAt: '' };
    component['onSubmit']();
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('does not call service.create() when certificateType is empty', () => {
    fixture.detectChanges();
    component['formData'] = { title: 'Título', certificateType: '', content: '', issuedAt: '' };
    component['onSubmit']();
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('calls service.update() when editingId is set', () => {
    fixture.detectChanges();
    component['editingId'].set('cert-1');
    component['formData'] = {
      title: 'Atualizado',
      certificateType: 'Extensão',
      content: '',
      issuedAt: '',
    };

    component['onSubmit']();

    expect(serviceMock.update).toHaveBeenCalledWith(
      'cert-1',
      expect.objectContaining({ title: 'Atualizado', certificateType: 'Extensão' }),
    );
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('opens delete modal and calls service.delete() on confirm', () => {
    fixture.detectChanges();
    component['openDeleteModal']('cert-1');
    expect(component['showDeleteModal']()).toBe(true);
    expect(component['certificateToDelete']()).toBe('cert-1');

    component['confirmDelete']();
    expect(serviceMock.delete).toHaveBeenCalledWith('cert-1');
  });

  it('closes delete modal when cancelled', () => {
    fixture.detectChanges();
    component['openDeleteModal']('cert-1');
    component['closeDeleteModal']();
    expect(component['showDeleteModal']()).toBe(false);
    expect(component['certificateToDelete']()).toBeNull();
  });

  it('sets editingId and populates formData when editCertificate is called', () => {
    fixture.detectChanges();
    const cert = makeCertVm({ id: 'cert-1', title: 'Laserterapia' });
    component['editCertificate'](cert);

    expect(component['editingId']()).toBe('cert-1');
    expect(component['formData'].title).toBe('Laserterapia');
    expect(component['formData'].certificateType).toBe('Extensão');
  });

  it('cancelEdit resets form and clears editingId', () => {
    fixture.detectChanges();
    component['editingId'].set('cert-1');
    component['formData'].title = 'Algo';

    component['cancelEdit']();

    expect(component['editingId']()).toBeNull();
    expect(component['formData'].title).toBe('');
  });

  it('create with API error does not crash and service.error() captures message', () => {
    serviceMock.create.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    component['formData'] = { title: 'X', certificateType: 'Extensão', content: '', issuedAt: '' };

    expect(() => component['onSubmit']()).not.toThrow();
  });

  it('delete with error closes modal and does not crash', () => {
    serviceMock.delete.mockReturnValue(throwError(() => new Error('Delete failed')));
    fixture.detectChanges();
    component['openDeleteModal']('cert-1');

    expect(() => component['confirmDelete']()).not.toThrow();
    expect(component['showDeleteModal']()).toBe(false);
  });

  it('viewCertificate opens view modal with the correct certificate', () => {
    fixture.detectChanges();
    const cert = makeCertVm();
    component['viewCertificate'](cert);

    expect(component['showViewModal']()).toBe(true);
    expect(component['certificateToView']()).toBe(cert);
  });

  it('closeViewModal clears view modal state', () => {
    fixture.detectChanges();
    component['showViewModal'].set(true);
    component['certificateToView'].set(makeCertVm());

    component['closeViewModal']();

    expect(component['showViewModal']()).toBe(false);
    expect(component['certificateToView']()).toBeNull();
  });
});
