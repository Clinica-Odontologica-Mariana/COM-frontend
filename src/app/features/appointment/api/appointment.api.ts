import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AgendaPatientOption,
  Appointment,
  AppointmentFormDto,
  AppointmentStatus,
  ProcedureType,
} from '../models/appointment.model';

// ─── Backend DTOs ──────────────────────────────────────────────────────────────

interface AppointmentApiDto {
  id: string;
  patientId: string;
  clinicId: string;
  workplaceId: string | null;
  professionalId: string | null;
  statusCode: string | null;
  statusName: string | null;
  blocksSchedule: boolean;
  startDatetime: string;
  endDatetime: string;
  notes: string | null;
  cancellationReason: string | null;
}

interface PatientSearchDto {
  id: string;
  fullName: string;
  email: string;
}

interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Mappers ───────────────────────────────────────────────────────────────────

function toStatus(statusCode: string | null | undefined): AppointmentStatus {
  const code = (statusCode ?? '').toUpperCase();
  if (code.includes('CONFIRM')) return 'confirmed';
  if (code.includes('CANCEL')) return 'cancelled';
  return 'pending';
}

/** Parses ISO datetime string (2026-06-15T09:00:00) into date and time parts. */
function parseDatetime(iso: string): { date: string; time: string } {
  const [date, timePart = '00:00:00'] = iso.split('T');
  return { date, time: timePart.slice(0, 5) };
}

/** Formats Date to ISO datetime string for backend (2026-06-15T00:00:00). */
function toDatetimeParam(date: Date, time = '00:00:00'): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T${time}`;
}

/** Combines date string (YYYY-MM-DD) and time string (HH:MM) into ISO datetime. */
function toDatetime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function toAppointment(dto: AppointmentApiDto): Appointment {
  const { date, time: startTime } = parseDatetime(dto.startDatetime);
  const { time: endTime } = parseDatetime(dto.endDatetime);

  return {
    id: dto.id,
    referenceCode: `#${dto.id.slice(0, 8).toUpperCase()}`,
    patientId: dto.patientId,
    patientName: '',
    patientEmail: undefined,
    patientInitials: undefined,
    procedure: 'avaliacao' as ProcedureType,
    procedureId: null,
    location: null,
    workplaceId: dto.workplaceId ?? null,
    clinicId: dto.clinicId ?? null,
    date,
    startTime,
    endTime,
    status: toStatus(dto.statusCode),
    notes: dto.notes ?? undefined,
    clinicalNotes: undefined,
    isBlocked: dto.blocksSchedule ?? false,
    title: dto.blocksSchedule ? (dto.notes ?? 'Bloqueado') : undefined,
  };
}

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(map((res) => res.data));
}

/** Normalizes response that can be either a Page object or a plain array. */
function toAppointmentList(res: PageDto<AppointmentApiDto> | AppointmentApiDto[]): Appointment[] {
  if (Array.isArray(res)) return res.map(toAppointment);
  return (res.content ?? []).map(toAppointment);
}

function pageParams(size = 200): HttpParams {
  return new HttpParams().set('page', '0').set('size', String(size)).set('sort', 'startDatetime,asc');
}

// ─── API Service ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AppointmentApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  /** List all appointments (no date filter). */
  list(): Observable<Appointment[]> {
    return unwrap(
      this.http.get<ApiResponse<PageDto<AppointmentApiDto>>>(`${this.base}/appointments`, {
        params: pageParams(),
      }),
    ).pipe(map((page) => page.content.map(toAppointment)));
  }

  /** List appointments in a date range via /appointments/period. */
  listByPeriod(startDate: Date, endDate: Date): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('start', toDatetimeParam(startDate, '00:00:00'))
      .set('end', toDatetimeParam(endDate, '23:59:59'));

    return unwrap(
      this.http.get<ApiResponse<PageDto<AppointmentApiDto> | AppointmentApiDto[]>>(
        `${this.base}/appointments/period`,
        { params },
      ),
    ).pipe(map((res) => toAppointmentList(res)));
  }

  /** Get all upcoming appointments (from today to far future). */
  listUpcoming(limit?: number): Observable<Appointment[]> {
    const today = new Date();
    const farFuture = new Date(2099, 11, 31);
    const params = new HttpParams()
      .set('start', toDatetimeParam(today, '00:00:00'))
      .set('end', toDatetimeParam(farFuture, '23:59:59'));

    return unwrap(
      this.http.get<ApiResponse<PageDto<AppointmentApiDto> | AppointmentApiDto[]>>(
        `${this.base}/appointments/period`,
        { params },
      ),
    ).pipe(
      map((res) =>
        toAppointmentList(res)
          .filter((a) => !a.isBlocked)
          .slice(0, limit),
      ),
    );
  }

  /**
   * No GET /appointments/{id} exists in the backend.
   * Fetches the period around today (±2 years) and finds by ID.
   * The backend team should add GET /appointments/{id} to avoid this.
   */
  getById(id: string): Observable<Appointment | undefined> {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 2);
    const future = new Date();
    future.setFullYear(future.getFullYear() + 2);

    return this.listByPeriod(past, future).pipe(
      map((items) => items.find((a) => a.id === id)),
    );
  }

  create(dto: AppointmentFormDto): Observable<Appointment> {
    const body = {
      patientId: dto.patientId,
      clinicId: dto.clinicId,
      workplaceId: dto.workplaceId,
      startDatetime: toDatetime(dto.date, dto.startTime),
      endDatetime: toDatetime(dto.date, dto.endTime),
      notes: dto.notes ?? null,
      blocksSchedule: false,
    };

    return unwrap(
      this.http.post<ApiResponse<AppointmentApiDto>>(`${this.base}/appointments`, body),
    ).pipe(map(toAppointment));
  }

  update(id: string, dto: Partial<AppointmentFormDto>): Observable<Appointment> {
    const date = dto.date ?? '';
    const body = {
      clinicId: dto.clinicId,
      workplaceId: dto.workplaceId,
      startDatetime: toDatetime(date, dto.startTime ?? '00:00'),
      endDatetime: toDatetime(date, dto.endTime ?? '00:00'),
      notes: dto.notes ?? null,
      blocksSchedule: false,
    };

    return unwrap(
      this.http.put<ApiResponse<AppointmentApiDto>>(`${this.base}/appointments/${id}`, body),
    ).pipe(map(toAppointment));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/appointments/${id}`);
  }

  searchPatients(query: string): Observable<AgendaPatientOption[]> {
    const params = new HttpParams().set('name', query.trim()).set('size', '10').set('page', '0');

    return unwrap(
      this.http.get<ApiResponse<PageDto<PatientSearchDto>>>(`${this.base}/patients`, { params }),
    ).pipe(
      map((page) =>
        page.content.map((p) => ({
          id: p.id,
          name: p.fullName,
          email: p.email,
          initials: toInitials(p.fullName),
        })),
      ),
    );
  }
}
