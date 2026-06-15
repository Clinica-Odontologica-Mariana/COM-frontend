export type SystemRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

export interface UserSummaryDto {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
}

export interface CreateUserRequestDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: SystemRole;
}

export interface CreateUserResponseDto {
  id: string;
  username: string;
  email: string;
  role: SystemRole;
}

export interface ProfessionalDto {
  id: string;
  userId: string;
  clinicId: string;
  specialtyId: string;
  licenseNumber: string;
  active: boolean;
}

export interface ProfessionalPageResponse {
  content: ProfessionalDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ProfessionalCreatePayload {
  userId: string;
  clinicId: string;
  specialtyId: string;
  licenseNumber: string;
}

export interface ProfessionalViewModel {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: SystemRole | 'UNKNOWN';
  clinicId: string;
  clinicName: string;
  specialtyId: string;
  licenseNumber: string;
  active: boolean;
}
