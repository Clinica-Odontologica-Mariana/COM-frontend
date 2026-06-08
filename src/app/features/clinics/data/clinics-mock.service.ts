import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  CLINIC_SCHEDULE_TEMPLATE,
  ClinicFormValue,
  ClinicRecord,
  cloneClinicSchedule,
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
    schedule: cloneClinicSchedule(CLINIC_SCHEDULE_TEMPLATE),
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
    schedule: cloneClinicSchedule([
      { dayKey: 'monday', label: 'Segunda-feira', enabled: false, openingTime: '09:00', closingTime: '20:00' },
      { dayKey: 'tuesday', label: 'Terça-feira', enabled: true, openingTime: '09:00', closingTime: '20:00' },
      { dayKey: 'wednesday', label: 'Quarta-feira', enabled: false, openingTime: '09:00', closingTime: '20:00' },
      { dayKey: 'thursday', label: 'Quinta-feira', enabled: true, openingTime: '09:00', closingTime: '20:00' },
      { dayKey: 'friday', label: 'Sexta-feira', enabled: false, openingTime: '09:00', closingTime: '20:00' },
      { dayKey: 'saturday', label: 'Sábado', enabled: false, openingTime: '09:00', closingTime: '14:00' },
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
    schedule: cloneClinicSchedule([
      { dayKey: 'monday', label: 'Segunda-feira', enabled: true, openingTime: '08:00', closingTime: '17:00' },
      { dayKey: 'tuesday', label: 'Terça-feira', enabled: true, openingTime: '08:00', closingTime: '17:00' },
      { dayKey: 'wednesday', label: 'Quarta-feira', enabled: true, openingTime: '08:00', closingTime: '17:00' },
      { dayKey: 'thursday', label: 'Quinta-feira', enabled: true, openingTime: '08:00', closingTime: '17:00' },
      { dayKey: 'friday', label: 'Sexta-feira', enabled: true, openingTime: '08:00', closingTime: '17:00' },
      { dayKey: 'saturday', label: 'Sábado', enabled: false, openingTime: '08:00', closingTime: '12:00' },
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

  create(payload: ClinicFormValue): Observable<ClinicRecord> {
    const clinic: ClinicRecord = {
      id: crypto.randomUUID(),
      active: true,
      ...payload,
      imageUrl: payload.imageUrl || CLINIC_IMAGES[this.clinicsState().length % CLINIC_IMAGES.length],
      schedule: cloneClinicSchedule(payload.schedule),
    };

    this.clinicsState.update((clinics) => [clinic, ...clinics]);
    return of(this.cloneClinic(clinic)).pipe(delay(180));
  }

  private cloneClinic(clinic: ClinicRecord): ClinicRecord {
    return {
      ...clinic,
      schedule: cloneClinicSchedule(clinic.schedule),
    };
  }
}
