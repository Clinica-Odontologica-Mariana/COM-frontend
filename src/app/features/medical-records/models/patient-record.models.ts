export interface PatientDTO {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  active: boolean;
  avatarUrl?: string;
}

export interface TreatmentSummaryDTO {
  progressPercentage: number;
  currentStep: string;
  description: string;
}

export interface FinancialSummaryDTO {
  balance: number;
  nextDueDate: string;
}

export interface ClinicalEvolutionDTO {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  status: 'FINISHED' | 'ARCHIVED' | 'IN_PROGRESS';
  tags: string[];
}

export interface PrescriptionDTO {
  id: number;
  medication: string;
  dosage: string;
  instructions: string;
}

export interface ProcedureDTO {
  id: number;
  name: string;
  performedAt: string;
  professional: string;
  status: 'DONE' | 'SCHEDULED' | 'CANCELED';
}

export interface MedicalAlertDTO {
  id: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PatientRecordDTO {
  treatmentSummary: TreatmentSummaryDTO;
  financial: FinancialSummaryDTO;
  alerts: MedicalAlertDTO[];
  procedures: ProcedureDTO[];
}

export interface CreateEvolutionDTO {
  patientId: number;
  title: string;
  description: string;
  tags: string[];
}

export interface PatientRecordState {
  patient: PatientDTO | null;
  treatmentSummary: TreatmentSummaryDTO | null;
  financial: FinancialSummaryDTO | null;
  evolutions: ClinicalEvolutionDTO[];
  prescriptions: PrescriptionDTO[];
  procedures: ProcedureDTO[];
  alerts: MedicalAlertDTO[];
  loading: boolean;
  creatingEvolution: boolean;
  error?: string;
}
