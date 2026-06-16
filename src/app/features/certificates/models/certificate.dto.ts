export interface CertificateDto {
  id: string;
  patientId: string;
  professionalId: string | null;
  title: string;
  certificateType: string;
  content: string | null;
  issuedAt: string | null;
  storedFileId: string | null;
  active: boolean;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateCreateDto {
  patientId: string;
  title: string;
  certificateType: string;
  professionalId?: string;
  content?: string;
  issuedAt?: string;
  storedFileId?: string;
}

export interface CertificateUpdateDto {
  title: string;
  certificateType: string;
  professionalId?: string;
  content?: string;
  issuedAt?: string;
  storedFileId?: string;
}
