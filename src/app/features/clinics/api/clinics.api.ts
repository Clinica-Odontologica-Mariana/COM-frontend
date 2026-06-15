import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CLINIC_SCHEDULE_TEMPLATE,
  ClinicDayKey,
  ClinicFormValue,
  ClinicRecord,
  WorkingInterval,
  WorkingDay,
  cloneWorkingDays,
} from '../models/clinic.models';

const DEFAULT_STATE = 'SP';
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

const DAY_TO_INDEX: Record<ClinicDayKey, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

@Injectable({ providedIn: 'root' })
export class ClinicsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  list(): Observable<ClinicRecord[]> {
    return unwrap(this.http.get<ApiResponse<PageDto<ClinicDto>>>(`${this.base}/clinics?size=100`)).pipe(
      map((page) => page.content.map((clinic) => toClinicRecord(clinic))),
    );
  }

  findById(id: string): Observable<ClinicRecord> {
    return unwrap(this.http.get<ApiResponse<ClinicDto>>(`${this.base}/clinics/${id}`)).pipe(
      map((clinic) => toClinicRecord(clinic)),
    );
  }

  create(payload: ClinicFormValue): Observable<ClinicRecord> {
    return this.submitCreate(payload).pipe(
      switchMap((clinic) => this.syncWorkingHours(clinic.id, payload.workingDays).pipe(map(() => clinic))),
      switchMap((clinic) => this.findById(clinic.id)),
    );
  }

  update(id: string, payload: ClinicFormValue, current: ClinicRecord): Observable<ClinicRecord> {
    return this.submitUpdate(id, payload).pipe(
      switchMap((clinic) => this.syncPhotoRemoval(clinic, payload, current)),
      switchMap((clinic) => this.syncWorkingHours(clinic.id, payload.workingDays).pipe(map(() => clinic))),
      switchMap((clinic) => this.syncStatus(clinic, current.active, payload.active)),
      switchMap((clinic) => this.findById(clinic.id)),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/clinics/${id}`);
  }

  private submitCreate(payload: ClinicFormValue): Observable<ClinicDto> {
    const body = toClinicPayload(payload);
    if (payload.imageFile) {
      return unwrap(this.http.post<ApiResponse<ClinicDto>>(`${this.base}/clinics`, toMultipartBody(body, payload)));
    }
    return unwrap(this.http.post<ApiResponse<ClinicDto>>(`${this.base}/clinics`, body));
  }

  private submitUpdate(id: string, payload: ClinicFormValue): Observable<ClinicDto> {
    const body = toClinicPayload(payload);
    if (payload.imageFile) {
      return unwrap(
        this.http.put<ApiResponse<ClinicDto>>(`${this.base}/clinics/${id}`, toMultipartBody(body, payload)),
      );
    }
    return unwrap(this.http.put<ApiResponse<ClinicDto>>(`${this.base}/clinics/${id}`, body));
  }

  private syncPhotoRemoval(
    clinic: ClinicDto,
    payload: ClinicFormValue,
    current: ClinicRecord,
  ): Observable<ClinicDto> {
    if (payload.imageRemoved && current.clinicPhotoFileId && !payload.imageFile) {
      return unwrap(this.http.delete<ApiResponse<ClinicDto>>(`${this.base}/clinics/${clinic.id}/photo`));
    }

    return of(clinic);
  }

  private syncWorkingHours(clinicId: string, days: WorkingDay[]): Observable<unknown> {
    return unwrap(
      this.http.get<ApiResponse<WorkingHoursDto[]>>(`${this.base}/working-hours?clinicId=${clinicId}`),
    ).pipe(
      switchMap((currentHours) => {
        const deleteRequests = currentHours.map((hours) =>
          this.http.delete<ApiResponse<null>>(`${this.base}/working-hours/${hours.id}`),
        );
        const createRequests = toWorkingHoursPayloads(clinicId, days).map((payload) =>
          this.http.post<ApiResponse<WorkingHoursDto>>(`${this.base}/working-hours`, payload),
        );
        const deleteStep = deleteRequests.length ? forkJoin(deleteRequests) : of([]);

        return deleteStep.pipe(switchMap(() => (createRequests.length ? forkJoin(createRequests) : of([]))));
      }),
    );
  }

  private syncStatus(clinic: ClinicDto, currentActive: boolean, nextActive: boolean): Observable<ClinicDto> {
    if (currentActive === nextActive) {
      return of(clinic);
    }

    const action = nextActive ? 'activate' : 'inactivate';
    return unwrap(this.http.patch<ApiResponse<ClinicDto>>(`${this.base}/clinics/${clinic.id}/${action}`, null));
  }
}

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(map((response) => response.data));
}

function toClinicRecord(clinic: ClinicDto): ClinicRecord {
  const address = clinic.address;
  return {
    id: clinic.id,
    addressId: clinic.addressId,
    name: clinic.name,
    phone: clinic.phone,
    email: clinic.email ?? '',
    whatsapp: clinic.whatsapp ?? '',
    instagram: clinic.instagram ?? '',
    street: address?.street ?? '',
    number: address?.number ?? '',
    neighborhood: address?.neighborhood ?? '',
    zipCode: address?.zipCode ?? '',
    city: address?.city ?? '',
    state: address?.state ?? DEFAULT_STATE,
    imageUrl: clinic.clinicPhotoUrl || '',
    clinicPhotoFileId: clinic.clinicPhotoFileId,
    workingDays: toWorkingDays(clinic.workingHours ?? []),
    active: clinic.active,
    inactiveType: clinic.inactiveType ?? undefined,
    inactiveFrom: clinic.inactiveFrom ?? undefined,
    inactiveTo: clinic.inactiveTo ?? undefined,
  };
}

function toClinicPayload(payload: ClinicFormValue): ClinicSaveDto {
  const normalizedEmail = payload.email.trim().toLowerCase();
  return {
    name: payload.name.trim(),
    phone: onlyDigits(payload.phone),
    email: normalizedEmail || null,
    timezone: DEFAULT_TIMEZONE,
    whatsapp: onlyDigits(payload.whatsapp),
    instagram: payload.instagram.trim(),
    inactiveType: null,
    inactiveFrom: null,
    inactiveTo: null,
    address: toAddressPayload(payload),
  };
}

function toAddressPayload(payload: ClinicFormValue): AddressSaveDto {
  return {
    street: payload.street.trim(),
    number: payload.number.trim(),
    complement: null,
    neighborhood: payload.neighborhood.trim(),
    city: payload.city.trim(),
    state: (payload.state || DEFAULT_STATE).trim().toUpperCase(),
    zipCode: onlyDigits(payload.zipCode),
  };
}

function toWorkingHoursPayloads(clinicId: string, days: WorkingDay[]): WorkingHoursSaveDto[] {
  return days.flatMap((day) =>
    day.enabled
      ? day.intervals.map((interval) => ({
          clinicId,
          dayOfWeek: DAY_TO_INDEX[day.dayKey],
          startTime: interval.startTime,
          endTime: interval.endTime,
        }))
      : [],
  );
}

function toMultipartBody(payload: ClinicSaveDto, formValue: ClinicFormValue): FormData {
  const formData = new FormData();
  formData.append('clinic', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (formValue.imageFile) {
    formData.append('photo', formValue.imageFile);
  }
  return formData;
}

function toWorkingDays(workingHours: WorkingHoursDto[]): WorkingDay[] {
  const template = cloneWorkingDays(CLINIC_SCHEDULE_TEMPLATE).map((day) => ({
    ...day,
    enabled: false,
    intervals: [] as WorkingInterval[],
  }));

  for (const hours of workingHours) {
    const day = template[hours.dayOfWeek];

    if (!day) {
      continue;
    }

    day.enabled = true;
    day.intervals.push({
      startTime: hours.startTime.slice(0, 5),
      endTime: hours.endTime.slice(0, 5),
    });
  }

  return template.map((day) => ({
    ...day,
    intervals: day.intervals.length ? day.intervals : [{ startTime: '08:00', endTime: '18:00' }],
  }));
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

interface PageDto<T> {
  content: T[];
}

interface ClinicDto {
  id: string;
  addressId: string | null;
  name: string;
  phone: string;
  email: string | null;
  timezone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  clinicPhotoFileId: string | null;
  clinicPhotoUrl: string | null;
  inactiveType: 'permanent' | 'temporary' | null;
  inactiveFrom: string | null;
  inactiveTo: string | null;
  active: boolean;
  address: AddressDto | null;
  workingHours: WorkingHoursDto[] | null;
}

interface ClinicSaveDto {
  name: string;
  phone: string;
  email: string | null;
  timezone: string;
  whatsapp: string;
  instagram: string;
  inactiveType: 'permanent' | 'temporary' | null;
  inactiveFrom: string | null;
  inactiveTo: string | null;
  address: AddressSaveDto;
}

interface AddressDto {
  id: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressSaveDto {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface WorkingHoursDto {
  id: string;
  clinicId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface WorkingHoursSaveDto {
  clinicId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
