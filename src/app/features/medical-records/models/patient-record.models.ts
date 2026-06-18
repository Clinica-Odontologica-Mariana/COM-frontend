// --- Backend DTOs (match Swagger exactly) ---

export interface PatientDTO {
  id: string;
  addressId: string | null;
  createdByUserId: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  active: boolean;
}

export interface MedicalRecordDTO {
  id: string;
  patientId: string;
  createdByUserId: string;
  allergies: string | null;
  chronicConditions: string | null;
  continuousMedications: string | null;
  generalObservations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordNoteDTO {
  id: string;
  medicalRecordId: string;
  createdByUserId: string;
  note: string;
  createdAt: string;
}

export interface MedicalRecordNoteCreateDTO {
  note: string;
}

export interface MedicalRecordNoteUpdateDTO {
  note: string;
}

export interface MedicalRecordAttachmentDTO {
  id: string;
  medicalRecordId: string;
  storedFileId: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  description: string | null;
  createdAt: string;
}

export interface MedicalRecordAttachmentCreateDTO {
  storedFileId: string;
  description?: string;
}

export interface TreatmentPlanDTO {
  id: string;
  patientId: string;
  medicalRecordId: string;
  professionalId: string;
  title: string;
  status: string;
  notes: string | null;
  totalAmount: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentPlanItemDTO {
  id: string;
  treatmentPlanId: string;
  procedureId: string;
  toothNumber: number | null;
  description: string;
  estimatedPrice: number;
  status: string;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
}

export interface OdontogramEntryDTO {
  id: string;
  medicalRecordId: string;
  patientId: string;
  toothNumber: number;
  surfaceCode: string;
  conditionCode: string;
  notes: string | null;
  recordedByProfessionalId: string;
  recordedAt: string;
}

export interface OdontogramFileSummaryDto {
  id: string;
  file: { id: string };
}

export interface PresignedUrlDTO {
  url: string;
  expiresAt: string;
}

// --- View models (domain layer, used by components) ---

export interface PatientView {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  active: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface MedicalAlertView {
  id: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'allergy' | 'condition' | 'medication';
}

export interface TreatmentSummaryView {
  progressPercentage: number;
  description: string;
  currentStep: string;
}

export interface LastVisitView {
  date: string;
  description: string;
}

export interface BalanceView {
  amount: number;
  // TODO: integrate with financial/billing endpoint when available
}

export interface ClinicalNoteView {
  id: string;
  title: string;
  note: string;
  createdAt: string;
}

export interface AttachmentView {
  id: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  description: string | null;
  createdAt: string;
  isImage: boolean;
  storedFileId: string;
  imageUrl: string | null;
}

export interface ProcedureView {
  id: string;
  description: string;
  status: string;
  toothNumber: number | null;
  estimatedPrice: number;
  completedAt: string | null;
}

// --- Facade state ---

export interface PatientRecordState {
  patient: PatientView | null;
  medicalRecord: MedicalRecordDTO | null;
  alerts: MedicalAlertView[];
  treatmentSummary: TreatmentSummaryView | null;
  lastVisit: LastVisitView | null;
  balance: BalanceView | null;
  notes: ClinicalNoteView[];
  attachments: AttachmentView[];
  procedures: ProcedureView[];
  loading: boolean;
  savingNote: boolean;
  uploadingAttachment: boolean;
  error: string | undefined;
}
