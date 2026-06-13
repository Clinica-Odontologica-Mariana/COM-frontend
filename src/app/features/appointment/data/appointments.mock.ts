import { Appointment } from '../models/appointment.model';
import { toIsoDate } from '../utils/calendar.utils';

function todayIso(): string {
  return toIsoDate(new Date());
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toIsoDate(d);
}

function nextFridayIso(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return toIsoDate(d);
}

function currentMonthDay(day: number): string {
  const d = new Date();
  d.setDate(day);
  return toIsoDate(d);
}

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    referenceCode: '#APT-4092-LM',
    patientId: 'p1',
    patientName: 'Lúcia Medeiros',
    patientEmail: 'lucia.medeiros@email.com',
    patientInitials: 'LM',
    procedure: 'implante_dentario',
    location: 'samambaia',
    date: currentMonthDay(6),
    startTime: '14:00',
    endTime: '15:30',
    status: 'confirmed',
    notes: 'Paciente apresenta sensibilidade no quadrante superior esquerdo.',
    clinicalNotes:
      'Paciente apresenta sensibilidade no quadrante superior esquerdo. Verificar integração óssea do implante anterior.',
  },
  {
    id: 'apt-block-1',
    referenceCode: '#BLK-001',
    patientId: '',
    patientName: '',
    procedure: 'limpeza',
    location: null,
    date: currentMonthDay(6),
    startTime: '12:00',
    endTime: '13:00',
    status: 'confirmed',
    isBlocked: true,
    title: 'Almoço',
  },
  {
    id: 'apt-2',
    referenceCode: '#APT-4093-RS',
    patientId: 'p2',
    patientName: 'Ricardo Siqueira',
    patientEmail: 'ricardo.siqueira@email.com',
    patientInitials: 'RS',
    procedure: 'check_up',
    location: 'asa_sul',
    date: currentMonthDay(7),
    startTime: '09:00',
    endTime: '10:00',
    status: 'pending',
    notes: '',
  },
  {
    id: 'apt-3',
    referenceCode: '#APT-4094-MA',
    patientId: 'p3',
    patientName: 'Marcos Alves',
    patientEmail: 'marcos.alves@email.com',
    patientInitials: 'MA',
    procedure: 'canal',
    location: 'taguatinga',
    date: currentMonthDay(24),
    startTime: '09:00',
    endTime: '11:00',
    status: 'confirmed',
    notes: '',
  },
  {
    id: 'apt-4',
    referenceCode: '#APT-4095-LM',
    patientId: 'p1',
    patientName: 'Lúcia Medeiros',
    patientEmail: 'lucia.medeiros@email.com',
    patientInitials: 'LM',
    procedure: 'implante',
    location: 'samambaia',
    date: todayIso(),
    startTime: '14:00',
    endTime: '15:30',
    status: 'confirmed',
    notes: '',
    clinicalNotes:
      'Paciente apresenta sensibilidade no quadrante superior esquerdo. Verificar integração óssea do implante anterior.',
  },
  {
    id: 'apt-5',
    referenceCode: '#APT-4096-RS',
    patientId: 'p2',
    patientName: 'Ricardo Siqueira',
    patientEmail: 'ricardo.siqueira@email.com',
    patientInitials: 'RS',
    procedure: 'limpeza',
    location: 'asa_sul',
    date: tomorrowIso(),
    startTime: '09:00',
    endTime: '10:00',
    status: 'pending',
    notes: '',
  },
  {
    id: 'apt-6',
    referenceCode: '#APT-4097-BF',
    patientId: 'p4',
    patientName: 'Beatriz Ferreira',
    patientEmail: 'beatriz.ferreira@email.com',
    patientInitials: 'BF',
    procedure: 'avaliacao',
    location: 'asa_sul',
    date: nextFridayIso(),
    startTime: '15:00',
    endTime: '16:00',
    status: 'pending',
    notes: '',
  },
];
