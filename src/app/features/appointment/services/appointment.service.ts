import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppointmentApi } from '../api/appointment.api';
import {
  AgendaPatientOption,
  Appointment,
  AppointmentFormDto,
  PROCEDURE_LABELS,
} from '../models/appointment.model';
import { toIsoDate } from '../utils/calendar.utils';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly api = inject(AppointmentApi);

  list(): Observable<Appointment[]> {
    return this.api.list();
  }

  listByMonth(year: number, month: number, workplaceIds?: string[] | null): Observable<Appointment[]> {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return this.api.listByPeriod(start, end).pipe(
      map((items) => this.filterByWorkplaces(items, workplaceIds)),
    );
  }

  listByDateRange(startIso: string, endIso: string, workplaceIds?: string[] | null): Observable<Appointment[]> {
    return this.api.listByPeriod(new Date(startIso + 'T00:00:00'), new Date(endIso + 'T23:59:59')).pipe(
      map((items) => this.filterByWorkplaces(items, workplaceIds)),
    );
  }

  listUpcoming(limit: number | null = 5, workplaceIds?: string[] | null): Observable<Appointment[]> {
    return this.api.listUpcoming(limit ?? undefined).pipe(
      map((items) => this.filterByWorkplaces(items, workplaceIds)),
    );
  }

  getById(id: string): Observable<Appointment | undefined> {
    return this.api.getById(id);
  }

  /**
   * Creates an appointment.
   * NOTE: The backend requires clinicId, professionalId, and statusId (UUIDs).
   * These must be configured before create can succeed.
   */
  create(dto: AppointmentFormDto): Observable<Appointment> {
    return this.api.create(dto);
  }

  /**
   * Updates an appointment.
   * NOTE: The backend requires statusId (UUID) for the status mapping.
   * Status update functionality requires status UUID resolution.
   */
  update(id: string, dto: Partial<AppointmentFormDto>): Observable<Appointment | undefined> {
    return this.api.update(id, dto).pipe(map((apt) => apt ?? undefined));
  }

  delete(id: string): Observable<boolean> {
    return this.api.delete(id).pipe(map(() => true));
  }

  searchPatients(query: string): Observable<AgendaPatientOption[]> {
    const q = query.trim();
    if (!q) return of([]);
    return this.api.searchPatients(q);
  }

  filterBySearch(items: Appointment[], query: string): Appointment[] {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((apt) => this.matchesSearch(apt, q));
  }

  private filterByWorkplaces(items: Appointment[], workplaceIds?: string[] | null): Appointment[] {
    if (!workplaceIds || workplaceIds.length === 0) return items;
    return items.filter((apt) => apt.isBlocked || (apt.workplaceId != null && workplaceIds.includes(apt.workplaceId)));
  }

  private matchesSearch(apt: Appointment, query: string): boolean {
    if (apt.isBlocked) {
      return apt.title?.toLowerCase().includes(query) ?? false;
    }

    return (
      apt.patientName.toLowerCase().includes(query) ||
      (apt.patientEmail?.toLowerCase().includes(query) ?? false) ||
      apt.referenceCode.toLowerCase().includes(query) ||
      (apt.procedure ? PROCEDURE_LABELS[apt.procedure].toLowerCase().includes(query) : false) ||
      (apt.notes?.toLowerCase().includes(query) ?? false)
    );
  }
}
