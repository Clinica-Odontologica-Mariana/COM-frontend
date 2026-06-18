export type AppointmentLocation = 'asa_sul' | 'samambaia' | 'taguatinga' | 'domiciliar';

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

export type ProcedureType =
  | 'implante'
  | 'implante_dentario'
  | 'check_up'
  | 'limpeza'
  | 'canal'
  | 'avaliacao';

export type CalendarViewMode = 'month' | 'week';

export interface Appointment {
  id: string;
  referenceCode: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientInitials?: string;
  professionalName?: string;
  procedure: ProcedureType;
  procedureId?: string | null;
  location: AppointmentLocation | null;
  workplaceId?: string | null;
  clinicId?: string | null;
  professionalId?: string | null;
  statusId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  clinicalNotes?: string;
  isBlocked?: boolean;
  title?: string;
}

export interface AppointmentFormDto {
  patientId: string;
  clinicId: string;
  workplaceId: string;
  professionalId: string;
  procedureId?: string | null;
  statusId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AgendaPatientOption {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export const LOCATION_LABELS: Record<AppointmentLocation, string> = {
  asa_sul: 'Asa Sul',
  samambaia: 'Samambaia',
  taguatinga: 'Taguatinga',
  domiciliar: 'Domiciliar',
};

export const PROCEDURE_LABELS: Record<ProcedureType, string> = {
  implante: 'Implante',
  implante_dentario: 'Implante Dentário',
  check_up: 'Check-up',
  limpeza: 'Limpeza',
  canal: 'Canal',
  avaliacao: 'Avaliação',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendente',
  cancelled: 'Cancelada',
};

export const LOCATION_COLORS: Record<AppointmentLocation, { bg: string; text: string; dot: string }> = {
  asa_sul: { bg: '#FFDAD3', text: '#30130D', dot: '#FFDAD3' },
  samambaia: { bg: '#7C5145', text: '#FFFFFF', dot: '#7C5145' },
  taguatinga: { bg: '#F5DECB', text: '#25190D', dot: '#F5DECB' },
  domiciliar: { bg: '#E8E8E8', text: '#514440', dot: '#83746F' },
};

export const BLOCKED_EVENT_COLOR = { bg: '#69594A', text: '#FFFFFF' };

export interface CalendarDay {
  date: Date;
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface WeekDayColumn {
  date: Date;
  isoDate: string;
  dayNumber: number;
  weekdayLabel: string;
  isToday: boolean;
}

export interface AppointmentFilters {
  search?: string;
  location?: AppointmentLocation;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}
