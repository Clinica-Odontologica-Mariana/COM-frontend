import { CertificateDto } from '../models/certificate.dto';
import { CertificateViewModel } from '../models/certificate.model';

export function adaptCertificate(dto: CertificateDto): CertificateViewModel {
  return {
    id: dto.id,
    title: dto.title,
    certificateType: dto.certificateType,
    content: dto.content ?? null,
    issuedAt: dto.issuedAt ?? null,
    storedFileId: dto.storedFileId ?? null,
    hasFile: !!dto.storedFileId,
    status: dto.active && !dto.revokedAt ? 'active' : 'revoked',
    issuedAtFormatted: dto.issuedAt ? formatIsoDate(dto.issuedAt) : null,
    createdAt: dto.createdAt,
  };
}

export function adaptCertificates(dtos: CertificateDto[]): CertificateViewModel[] {
  return dtos.map(adaptCertificate);
}

function formatIsoDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR');
}
