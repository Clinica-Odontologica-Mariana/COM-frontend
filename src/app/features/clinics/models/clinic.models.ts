export type ClinicDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface ClinicScheduleDay {
  dayKey: ClinicDayKey;
  label: string;
  enabled: boolean;
  openingTime: string;
  closingTime: string;
}

export interface ClinicRecord {
  id: string;
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
  imageUrl: string;
  schedule: ClinicScheduleDay[];
  active: boolean;
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
  imageUrl: string;
  schedule: ClinicScheduleDay[];
}

export interface ClinicCardViewModel extends ClinicRecord {
  addressLabel: string;
  serviceDaysLabel: string;
  serviceWindowLabel: string;
}

export const CLINIC_SCHEDULE_TEMPLATE: ClinicScheduleDay[] = [
  { dayKey: 'monday', label: 'Segunda-feira', enabled: true, openingTime: '08:00', closingTime: '18:00' },
  { dayKey: 'tuesday', label: 'Terça-feira', enabled: true, openingTime: '08:00', closingTime: '18:00' },
  { dayKey: 'wednesday', label: 'Quarta-feira', enabled: true, openingTime: '08:00', closingTime: '18:00' },
  { dayKey: 'thursday', label: 'Quinta-feira', enabled: true, openingTime: '08:00', closingTime: '18:00' },
  { dayKey: 'friday', label: 'Sexta-feira', enabled: true, openingTime: '08:00', closingTime: '18:00' },
  { dayKey: 'saturday', label: 'Sábado', enabled: false, openingTime: '08:00', closingTime: '12:00' },
];

export function cloneClinicSchedule(schedule: ClinicScheduleDay[]): ClinicScheduleDay[] {
  return schedule.map((day) => ({ ...day }));
}

export function toClinicCardViewModel(clinic: ClinicRecord): ClinicCardViewModel {
  const enabledDays = clinic.schedule.filter((day) => day.enabled);
  const firstEnabledDay = enabledDays[0];
  const addressParts = [
    [clinic.street, clinic.number].filter(Boolean).join(', '),
    clinic.neighborhood,
    clinic.city,
  ].filter(Boolean);

  return {
    ...clinic,
    addressLabel: addressParts.join(' - '),
    serviceDaysLabel: formatClinicScheduleDays(enabledDays),
    serviceWindowLabel: firstEnabledDay
      ? `${firstEnabledDay.openingTime} - ${firstEnabledDay.closingTime}`
      : '--:-- - --:--',
  };
}

function formatClinicScheduleDays(days: ClinicScheduleDay[]): string {
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
