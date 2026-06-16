import { describe, expect, it } from 'vitest';

import { CertificateDto } from '../models/certificate.dto';
import { adaptCertificate, adaptCertificates } from './certificate.adapter';

const makeDto = (overrides: Partial<CertificateDto> = {}): CertificateDto => ({
  id: 'cert-1',
  patientId: 'patient-1',
  professionalId: null,
  title: 'Especialização em Implantodontia',
  certificateType: 'Especialização',
  content: 'CFO — 360h',
  issuedAt: '2023-06-15T00:00:00Z',
  storedFileId: null,
  active: true,
  revokedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('adaptCertificate', () => {
  it('maps id, title and certificateType from DTO', () => {
    const vm = adaptCertificate(makeDto());
    expect(vm.id).toBe('cert-1');
    expect(vm.title).toBe('Especialização em Implantodontia');
    expect(vm.certificateType).toBe('Especialização');
  });

  it('status is active when active=true and revokedAt=null', () => {
    const vm = adaptCertificate(makeDto({ active: true, revokedAt: null }));
    expect(vm.status).toBe('active');
  });

  it('status is revoked when active=false', () => {
    const vm = adaptCertificate(makeDto({ active: false, revokedAt: null }));
    expect(vm.status).toBe('revoked');
  });

  it('status is revoked when revokedAt is set even if active=true', () => {
    const vm = adaptCertificate(makeDto({ active: true, revokedAt: '2024-01-01T00:00:00Z' }));
    expect(vm.status).toBe('revoked');
  });

  it('hasFile is true when storedFileId is present', () => {
    const vm = adaptCertificate(makeDto({ storedFileId: 'file-uuid' }));
    expect(vm.hasFile).toBe(true);
    expect(vm.storedFileId).toBe('file-uuid');
  });

  it('hasFile is false when storedFileId is null', () => {
    const vm = adaptCertificate(makeDto({ storedFileId: null }));
    expect(vm.hasFile).toBe(false);
    expect(vm.storedFileId).toBeNull();
  });

  it('formats issuedAt as pt-BR date string', () => {
    const vm = adaptCertificate(makeDto({ issuedAt: '2023-06-15T00:00:00Z' }));
    expect(vm.issuedAtFormatted).not.toBeNull();
    expect(vm.issuedAt).toBe('2023-06-15T00:00:00Z');
  });

  it('issuedAtFormatted is null when issuedAt is null', () => {
    const vm = adaptCertificate(makeDto({ issuedAt: null }));
    expect(vm.issuedAtFormatted).toBeNull();
    expect(vm.issuedAt).toBeNull();
  });

  it('content is null when DTO content is null', () => {
    const vm = adaptCertificate(makeDto({ content: null }));
    expect(vm.content).toBeNull();
  });

  it('preserves content string', () => {
    const vm = adaptCertificate(makeDto({ content: 'Descrição detalhada' }));
    expect(vm.content).toBe('Descrição detalhada');
  });
});

describe('adaptCertificates', () => {
  it('returns empty array for empty input', () => {
    expect(adaptCertificates([])).toEqual([]);
  });

  it('maps multiple DTOs to ViewModels', () => {
    const dtos = [
      makeDto({ id: 'c1', title: 'Cert 1' }),
      makeDto({ id: 'c2', title: 'Cert 2' }),
    ];
    const vms = adaptCertificates(dtos);
    expect(vms).toHaveLength(2);
    expect(vms[0].id).toBe('c1');
    expect(vms[1].id).toBe('c2');
  });
});
