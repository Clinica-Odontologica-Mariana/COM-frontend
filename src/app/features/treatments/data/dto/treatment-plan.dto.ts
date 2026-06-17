export interface TreatmentPlanDto {
  id: string;
  patientId: string;
  medicalRecordId: string | null;
  title: string;
  status: string;
  notes: string | null;
  totalAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialItemDto {
  name: string;
  category: string;
  quantity: number;
}

export interface TreatmentPlanItemDto {
  id: string;
  treatmentPlanId: string;
  procedureId: string | null;
  toothNumber: number | null;
  description: string;
  estimatedPrice: number;
  status: string;
  sortOrder: number | null;
  completedAt: string | null;
  createdAt: string;
  materials?: MaterialItemDto[];
}

export interface PatientDto {
  id: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
}

export interface ClinicalProcedureDto {
  id: string;
  name: string;
  category: string;
}

export interface MedicalRecordDto {
  id: string;
  patientId: string;
  generalObservations: string | null;
}

export interface OdontogramEntryDto {
  id: string;
  patientId: string;
  toothNumber: number;
  conditionCode: string | null;
}
