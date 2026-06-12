export type PatientGender = 'female' | 'male' | 'other';
export type PatientStatus = 'active' | 'inactive';

export const HEALTH_CONDITIONS = [
  'Hipertensão',
  'Diabetes',
  'Alergia a Medicação',
  'Cardiopatias',
  'Fumante',
  'Gestante',
] as const;

export type HealthCondition = (typeof HEALTH_CONDITIONS)[number];

export interface PatientAddress {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Patient {
  id: string;
  registrationNumber: string;
  status: PatientStatus;
  fullName: string;
  cpf: string;
  birthDate: string;
  profession: string;
  gender: PatientGender;
  photoUrl?: string;
  chiefComplaint: string;
  healthConditions: HealthCondition[];
  continuousMedications: string;
  phone: string;
  email: string;
  whatsappReminders: boolean;
  address: PatientAddress;
  lastConsultationDate?: string;
  nextConsultationDate?: string;
}

export type PatientFormDto = Omit<Patient, 'id' | 'registrationNumber'>;

export interface PatientFilters {
  name?: string;
  cpf?: string;
  status?: PatientStatus | '';
}

export interface PaginatedPatients {
  items: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
