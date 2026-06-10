import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  CLINIC_SCHEDULE_TEMPLATE,
  ClinicFormValue,
  ClinicRecord,
  cloneWorkingDays,
} from '../models/clinic.models';

const CLINIC_IMAGES = ['/clinic-card-1.png', '/clinic-card-2.png', '/clinic-card-3.png'] as const;

const INITIAL_CLINICS: ClinicRecord[] = [
  {
    id: crypto.randomUUID(),
    name: 'Clínica Jardim',
    phone: '(11) 99843-9300',
    email: 'jardim@dramariana.odo.br',
    whatsapp: '(11) 99843-9300',
    instagram: '@clinicajardim',
    street: 'Alameda das Flores',
    number: '1024',
    neighborhood: 'Jardim América',
    zipCode: '01418000',
    city: 'São Paulo',
    imageUrl: CLINIC_IMAGES[0],
    workingDays: cloneWorkingDays(CLINIC_SCHEDULE_TEMPLATE),
    active: true,
  },
  {
    id: crypto.randomUUID(),
    name: 'Odonto Prime',
    phone: '(11) 98812-1020',
    email: 'prime@dramariana.odo.br',
    whatsapp: '(11) 98812-1020',
    instagram: '@odontoprime',
    street: 'Av. Paulista',
    number: '2000',
    neighborhood: 'Cerqueira César',
    zipCode: '01310100',
    city: 'São Paulo',
    imageUrl: CLINIC_IMAGES[1],
    workingDays: cloneWorkingDays([
      {
        dayKey: 'monday',
        label: 'Segunda-feira',
        enabled: false,
        intervals: [{ startTime: '09:00', endTime: '20:00' }],
      },
      {
        dayKey: 'tuesday',
        label: 'Terça-feira',
        enabled: true,
        intervals: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '14:00', endTime: '20:00' },
        ],
      },
      {
        dayKey: 'wednesday',
        label: 'Quarta-feira',
        enabled: false,
        intervals: [{ startTime: '09:00', endTime: '20:00' }],
      },
      {
        dayKey: 'thursday',
        label: 'Quinta-feira',
        enabled: true,
        intervals: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '14:00', endTime: '20:00' },
        ],
      },
      {
        dayKey: 'friday',
        label: 'Sexta-feira',
        enabled: false,
        intervals: [{ startTime: '09:00', endTime: '20:00' }],
      },
      {
        dayKey: 'saturday',
        label: 'Sábado',
        enabled: false,
        intervals: [{ startTime: '09:00', endTime: '14:00' }],
      },
      {
        dayKey: 'sunday',
        label: 'Domingo',
        enabled: false,
        intervals: [{ startTime: '09:00', endTime: '14:00' }],
      },
    ]),
    active: true,
  },
  {
    id: crypto.randomUUID(),
    name: 'Sorriso Real',
    phone: '(11) 97654-3321',
    email: 'sorrisoreal@dramariana.odo.br',
    whatsapp: '(11) 97654-3321',
    instagram: '@sorrisoreal',
    street: 'Rua das Acácias',
    number: '45',
    neighborhood: 'Vila Madalena',
    zipCode: '05435000',
    city: 'São Paulo',
    imageUrl: CLINIC_IMAGES[2],
    workingDays: cloneWorkingDays([
      {
        dayKey: 'monday',
        label: 'Segunda-feira',
        enabled: true,
        intervals: [{ startTime: '08:00', endTime: '17:00' }],
      },
      {
        dayKey: 'tuesday',
        label: 'Terça-feira',
        enabled: true,
        intervals: [{ startTime: '08:00', endTime: '17:00' }],
      },
      {
        dayKey: 'wednesday',
        label: 'Quarta-feira',
        enabled: true,
        intervals: [{ startTime: '08:00', endTime: '17:00' }],
      },
      {
        dayKey: 'thursday',
        label: 'Quinta-feira',
        enabled: true,
        intervals: [{ startTime: '08:00', endTime: '17:00' }],
      },
      {
        dayKey: 'friday',
        label: 'Sexta-feira',
        enabled: true,
        intervals: [{ startTime: '08:00', endTime: '17:00' }],
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
    ]),
    active: true,
  },
];

@Injectable({ providedIn: 'root' })
export class ClinicsMockService {
  private readonly clinicsState = signal<ClinicRecord[]>(INITIAL_CLINICS);

  list(): Observable<ClinicRecord[]> {
    return of(this.clinicsState().map((clinic) => this.cloneClinic(clinic))).pipe(delay(220));
  }

  findById(id: string): Observable<ClinicRecord> {
    const clinic = this.clinicsState().find((item) => item.id === id);

    if (!clinic) {
      return throwError(() => new Error('Clínica não encontrada.'));
    }

    return of(this.cloneClinic(clinic)).pipe(delay(180));
  }

  create(payload: ClinicFormValue): Observable<ClinicRecord> {
    const clinic: ClinicRecord = {
      id: crypto.randomUUID(),
      ...payload,
      imageUrl:
        payload.imageUrl || CLINIC_IMAGES[this.clinicsState().length % CLINIC_IMAGES.length],
      workingDays: cloneWorkingDays(payload.workingDays),
      inactiveType: !payload.active ? payload.inactiveType : undefined,
      inactiveFrom:
        !payload.active && payload.inactiveType === 'temporary' ? payload.inactiveFrom : undefined,
      inactiveTo:
        !payload.active && payload.inactiveType === 'temporary' ? payload.inactiveTo : undefined,
    };

    this.clinicsState.update((clinics) => [clinic, ...clinics]);
    return of(this.cloneClinic(clinic)).pipe(delay(180));
  }

  update(id: string, payload: ClinicFormValue): Observable<ClinicRecord> {
    const current = this.clinicsState().find((clinic) => clinic.id === id);

    if (!current) {
      return throwError(() => new Error('Clínica não encontrada.'));
    }

    const updated: ClinicRecord = {
      ...current,
      ...payload,
      imageUrl: payload.imageUrl || current.imageUrl,
      workingDays: cloneWorkingDays(payload.workingDays),
      inactiveType: !payload.active ? payload.inactiveType : undefined,
      inactiveFrom:
        !payload.active && payload.inactiveType === 'temporary' ? payload.inactiveFrom : undefined,
      inactiveTo:
        !payload.active && payload.inactiveType === 'temporary' ? payload.inactiveTo : undefined,
    };

    this.clinicsState.update((clinics) =>
      clinics.map((clinic) => (clinic.id === id ? updated : clinic)),
    );

    return of(this.cloneClinic(updated)).pipe(delay(180));
  }

  inactivate(id: string): Observable<void> {
    this.clinicsState.update((clinics) =>
      clinics.map((clinic) =>
        clinic.id === id
          ? {
              ...clinic,
              active: false,
              inactiveType: 'permanent',
              inactiveFrom: undefined,
              inactiveTo: undefined,
            }
          : clinic,
      ),
    );

    return of(void 0).pipe(delay(160));
  }

  private cloneClinic(clinic: ClinicRecord): ClinicRecord {
    const cloned = { ...clinic, workingDays: cloneWorkingDays(clinic.workingDays) };

    if (!cloned.active && cloned.inactiveType === 'temporary' && cloned.inactiveTo) {
      const today = new Date().toISOString().slice(0, 10);
      if (today > cloned.inactiveTo) {
        return {
          ...cloned,
          active: true,
          inactiveType: undefined,
          inactiveFrom: undefined,
          inactiveTo: undefined,
        };
      }
    }

    return cloned;
  }
}
