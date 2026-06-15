export type InactiveType = 'permanent' | 'temporary';

export type ClinicDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface WorkingInterval {
  startTime: string;
  endTime: string;
}

export interface WorkingDay {
  dayKey: ClinicDayKey;
  label: string;
  enabled: boolean;
  intervals: WorkingInterval[];
}

export interface ClinicRecord {
  id: string;
  addressId?: string | null;
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
  city: string;
  state: string;
  imageUrl: string;
  clinicPhotoFileId?: string | null;
  workingDays: WorkingDay[];
  active: boolean;
  inactiveType?: InactiveType;
  inactiveFrom?: string;
  inactiveTo?: string;
}

export interface ClinicFormValue {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
  city: string;
  state: string;
  imageUrl: string;
  imageFile?: File | null;
  imageRemoved?: boolean;
  workingDays: WorkingDay[];
  active: boolean;
  inactiveType?: InactiveType;
  inactiveFrom?: string;
  inactiveTo?: string;
}

export interface ClinicCardViewModel extends ClinicRecord {
  addressLabel: string;
  serviceDaysLabel: string;
  serviceWindowLabel: string;
}

export const CLINIC_SCHEDULE_TEMPLATE: WorkingDay[] = [
  {
    dayKey: 'monday',
    label: 'Segunda-feira',
    enabled: true,
    intervals: [{ startTime: '08:00', endTime: '18:00' }],
  },
  {
    dayKey: 'tuesday',
    label: 'Terça-feira',
    enabled: true,
    intervals: [{ startTime: '08:00', endTime: '18:00' }],
  },
  {
    dayKey: 'wednesday',
    label: 'Quarta-feira',
    enabled: true,
    intervals: [{ startTime: '08:00', endTime: '18:00' }],
  },
  {
    dayKey: 'thursday',
    label: 'Quinta-feira',
    enabled: true,
    intervals: [{ startTime: '08:00', endTime: '18:00' }],
  },
  {
    dayKey: 'friday',
    label: 'Sexta-feira',
    enabled: true,
    intervals: [{ startTime: '08:00', endTime: '18:00' }],
  },
  {
    dayKey: 'saturday',
    label: 'Sábado',
    enabled: false,
    intervals: [{ startTime: '08:00', endTime: '12:00' }],
  },
  {
    dayKey: 'sunday',
    label: 'Domingo',
    enabled: false,
    intervals: [{ startTime: '08:00', endTime: '12:00' }],
  },
];

export function cloneWorkingDays(days: WorkingDay[]): WorkingDay[] {
  return days.map((day) => ({
    ...day,
    intervals: day.intervals.map((interval) => ({ ...interval })),
  }));
}

export function toClinicCardViewModel(clinic: ClinicRecord): ClinicCardViewModel {
  const enabledDays = clinic.workingDays.filter((day) => day.enabled);

  const addressParts = [
    [clinic.street, clinic.number].filter(Boolean).join(', '),
    clinic.neighborhood,
    clinic.city,
  ].filter(Boolean);

  return {
    ...clinic,
    addressLabel: addressParts.join(' - '),
    serviceDaysLabel: formatWorkingDays(enabledDays),
    serviceWindowLabel: formatServiceWindow(enabledDays),
  };
}

function formatWorkingDays(days: WorkingDay[]): string {
  if (!days.length) {
    return 'Nenhum dia configurado';
  }

  const labels = days.map((day) => day.label.replace('-feira', ''));

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} e ${labels[1]}`;
  }

  const lastLabel = labels.at(-1);
  return `${labels.slice(0, -1).join(', ')} e ${lastLabel}`;
}

function formatServiceWindow(days: WorkingDay[]): string {
  if (!days.length) {
    return '--:-- - --:--';
  }

  if (days.length === 1) {
    return days[0].intervals.map((interval) => `${interval.startTime} - ${interval.endTime}`).join(', ');
  }

  const serializedIntervals = days.map((day) =>
    day.intervals.map((interval) => `${interval.startTime}-${interval.endTime}`).join('|'),
  );
  const firstSerializedIntervals = serializedIntervals[0];
  const sameScheduleForAllDays = serializedIntervals.every(
    (serializedIntervalsForDay) => serializedIntervalsForDay === firstSerializedIntervals,
  );

  if (!sameScheduleForAllDays) {
    return 'Horários variados';
  }

  return days[0].intervals.map((interval) => `${interval.startTime} - ${interval.endTime}`).join(', ');
}
