export interface CertificateViewModel {
  id: string;
  title: string;
  certificateType: string;
  content: string | null;
  issuedAt: string | null;
  storedFileId: string | null;
  hasFile: boolean;
  status: 'active' | 'revoked';
  issuedAtFormatted: string | null;
  createdAt: string;
}

export interface CertificateState {
  certificates: CertificateViewModel[];
  loading: boolean;
  saving: boolean;
  deletingId: string | null;
  error: string | null;
}

export interface CertificateFormData {
  title: string;
  certificateType: string;
  content: string;
  issuedAt: string;
}
