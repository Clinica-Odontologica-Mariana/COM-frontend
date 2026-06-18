export type CollaboratorRole = 'ADMIN' | 'RECEPTIONIST' | 'DENTIST' | 'ASSISTANT';
export type CollaboratorStatus = 'ACTIVE' | 'INACTIVE';
export type CollaboratorAccessMode = 'INVITE' | 'MANUAL';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Workplace {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface SpecialtyOption {
  id: string;
  label: string;
}

export interface ServiceOption {
  id: string;
  label: string;
}

export interface CollaboratorPermissionFlags {
  managePatients: boolean;
  viewReports: boolean;
  uploadFiles: boolean;
}

export interface CollaboratorWorkingHour {
  id: string;
  weekday: WeekDay;
  startTime: string;
  endTime: string;
  workplaceId: string;
}

export interface CollaboratorAddress {
  zipCode: string;
  street: string;
  number: string;
  city: string;
  state: string;
}

export interface Collaborator {
  id: string;
  avatarUrl: string;
  fullName: string;
  documentId: string;
  birthDate: string | null;
  email: string;
  phone: string;
  address: CollaboratorAddress;
  roles: CollaboratorRole[];
  workplaceIds: string[];
  status: CollaboratorStatus;
  professionalId: string;
  specialties: string[];
  servicesProvided: string[];
  workingHours: CollaboratorWorkingHour[];
  canManageAppointments: boolean;
  superAdmin: boolean;
  permissions: CollaboratorPermissionFlags;
  accessMode: CollaboratorAccessMode;
  passwordStrength: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollaboratorFormValue {
  avatarFile: File | null;
  avatarPreviewUrl: string;
  fullName: string;
  documentId: string;
  birthDate: string;
  email: string;
  phone: string;
  address: CollaboratorAddress;
  roles: CollaboratorRole[];
  workplaceIds: string[];
  status: CollaboratorStatus;
  professionalId: string;
  specialties: string[];
  servicesProvided: string[];
  workingHours: CollaboratorWorkingHour[];
  canManageAppointments: boolean;
  superAdmin: boolean;
  permissions: CollaboratorPermissionFlags;
  accessMode: CollaboratorAccessMode;
  password: string;
  passwordConfirm: string;
  notes: string;
}

export interface CollaboratorListFilters {
  query: string;
  role: CollaboratorRole | 'ALL';
  workplaceId: string | 'ALL';
  status: CollaboratorStatus | 'ALL';
}

export interface CollaboratorCollections {
  workplaces: Workplace[];
  specialties: SpecialtyOption[];
  services: ServiceOption[];
}

export interface AddressLookupResult {
  zipCode: string;
  street: string;
  city: string;
  state: string;
}

export const COLLABORATOR_ROLE_OPTIONS: Array<{ value: CollaboratorRole; label: string }> = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'RECEPTIONIST', label: 'Recepcionista' },
  { value: 'DENTIST', label: 'Dentista' },
  { value: 'ASSISTANT', label: 'Auxiliar' },
];

export const WEEKDAY_OPTIONS: Array<{ value: WeekDay; label: string }> = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export function createEmptyWorkingHour(): CollaboratorWorkingHour {
  return {
    id: cryptoRandomId(),
    weekday: 'monday',
    startTime: '08:00',
    endTime: '12:00',
    workplaceId: '',
  };
}

export function createEmptyCollaboratorForm(): CollaboratorFormValue {
  return {
    avatarFile: null,
    avatarPreviewUrl: '',
    fullName: '',
    documentId: '',
    birthDate: '',
    email: '',
    phone: '',
    address: {
      zipCode: '',
      street: '',
      number: '',
      city: '',
      state: '',
    },
    roles: ['RECEPTIONIST'],
    workplaceIds: [],
    status: 'ACTIVE',
    professionalId: '',
    specialties: [],
    servicesProvided: [],
    workingHours: [createEmptyWorkingHour()],
    canManageAppointments: true,
    superAdmin: false,
    permissions: {
      managePatients: false,
      viewReports: false,
      uploadFiles: false,
    },
    accessMode: 'INVITE',
    password: '',
    passwordConfirm: '',
    notes: '',
  };
}

export function cloneCollaboratorForm(value: CollaboratorFormValue): CollaboratorFormValue {
  return {
    ...value,
    address: { ...value.address },
    roles: [...value.roles],
    workplaceIds: [...value.workplaceIds],
    specialties: [...value.specialties],
    servicesProvided: [...value.servicesProvided],
    workingHours: value.workingHours.map((workingHour) => ({ ...workingHour })),
    permissions: { ...value.permissions },
  };
}

export function normalizeDocumentId(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function formatPhoneValue(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  if (!digits) {
    return '';
  }

  return `+${digits}`;
}

export function passwordStrengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) {
    return 'CO';
  }
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}
