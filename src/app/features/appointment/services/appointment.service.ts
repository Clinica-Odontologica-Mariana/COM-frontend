import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { INITIAL_APPOINTMENTS } from '../data/appointments.mock';
import { AGENDA_PATIENTS } from '../data/patients.mock';
import {
  AgendaPatientOption,
  Appointment,
  AppointmentFormDto,
  AppointmentLocation,
  LOCATION_LABELS,
  PROCEDURE_LABELS,
} from '../models/appointment.model';
import { toIsoDate } from '../utils/calendar.utils';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private appointments: Appointment[] = structuredClone(INITIAL_APPOINTMENTS);
  private nextId = 100;

  list(): Observable<Appointment[]> {
    return of([...this.appointments]).pipe(delay(150));
  }

  listByMonth(year: number, month: number, locations?: AppointmentLocation[] | null): Observable<Appointment[]> {
    return this.list().pipe(
      map((items) =>
        items.filter((apt) => {
          const d = new Date(apt.date + 'T00:00:00');
          if (d.getFullYear() !== year || d.getMonth() !== month) return false;
          return this.matchesLocation(apt, locations);
        }),
      ),
    );
  }

  listByDateRange(startIso: string, endIso: string, locations?: AppointmentLocation[] | null): Observable<Appointment[]> {
    return this.list().pipe(
      map((items) =>
        items.filter((apt) => {
          if (apt.date < startIso || apt.date > endIso) return false;
          return this.matchesLocation(apt, locations);
        }),
      ),
    );
  }

  listUpcoming(limit: number | null = 5, locations?: AppointmentLocation[] | null): Observable<Appointment[]> {
    const today = toIsoDate(new Date());
    return this.list().pipe(
      map((items) => {
        const sorted = items
          .filter((apt) => !apt.isBlocked && apt.date >= today && this.matchesLocation(apt, locations))
          .sort((a, b) => {
            const cmp = a.date.localeCompare(b.date);
            if (cmp !== 0) return cmp;
            return a.startTime.localeCompare(b.startTime);
          });
        return limit != null ? sorted.slice(0, limit) : sorted;
      }),
    );
  }

  getById(id: string): Observable<Appointment | undefined> {
    return of(this.appointments.find((a) => a.id === id)).pipe(delay(100));
  }

  create(dto: AppointmentFormDto): Observable<Appointment> {
    const patient = AGENDA_PATIENTS.find((p) => p.id === dto.patientId);
    const appointment: Appointment = {
      id: `apt-${this.nextId++}`,
      referenceCode: `#APT-${4090 + this.nextId}-${patient?.initials ?? 'XX'}`,
      patientId: dto.patientId,
      patientName: patient?.name ?? 'Paciente',
      patientEmail: patient?.email,
      patientInitials: patient?.initials,
      procedure: dto.procedure,
      location: dto.location,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status ?? 'pending',
      notes: dto.notes,
      clinicalNotes: dto.clinicalNotes,
    };
    this.appointments.push(appointment);
    return of(appointment).pipe(delay(200));
  }

  update(id: string, dto: Partial<AppointmentFormDto>): Observable<Appointment | undefined> {
    const index = this.appointments.findIndex((a) => a.id === id);
    if (index === -1) return of(undefined).pipe(delay(100));

    const current = this.appointments[index];
    const updated: Appointment = {
      ...current,
      procedure: dto.procedure ?? current.procedure,
      location: dto.location ?? current.location,
      date: dto.date ?? current.date,
      startTime: dto.startTime ?? current.startTime,
      endTime: dto.endTime ?? current.endTime,
      status: dto.status ?? current.status,
      notes: dto.notes ?? current.notes,
      clinicalNotes: dto.clinicalNotes ?? current.clinicalNotes,
    };
    this.appointments[index] = updated;
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const before = this.appointments.length;
    this.appointments = this.appointments.filter((a) => a.id !== id);
    return of(this.appointments.length < before).pipe(delay(150));
  }

  searchPatients(query: string): Observable<AgendaPatientOption[]> {
    const q = query.trim().toLowerCase();
    if (!q) return of([]).pipe(delay(80));
    return of(
      AGENDA_PATIENTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
      ),
    ).pipe(delay(120));
  }

  filterBySearch(items: Appointment[], query: string): Appointment[] {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((apt) => this.matchesSearch(apt, q));
  }

  private matchesSearch(apt: Appointment, query: string): boolean {
    if (apt.isBlocked) {
      return (apt.title?.toLowerCase().includes(query) ?? false);
    }

    const locationLabel = apt.location ? LOCATION_LABELS[apt.location].toLowerCase() : '';
    return (
      apt.patientName.toLowerCase().includes(query) ||
      (apt.patientEmail?.toLowerCase().includes(query) ?? false) ||
      apt.referenceCode.toLowerCase().includes(query) ||
      PROCEDURE_LABELS[apt.procedure].toLowerCase().includes(query) ||
      locationLabel.includes(query) ||
      (apt.notes?.toLowerCase().includes(query) ?? false)
    );
  }

  private matchesLocation(apt: Appointment, locations?: AppointmentLocation[] | null): boolean {
    if (!locations || locations.length === 0) return true;
    if (apt.isBlocked) return true;
    return apt.location != null && locations.includes(apt.location);
  }
}
