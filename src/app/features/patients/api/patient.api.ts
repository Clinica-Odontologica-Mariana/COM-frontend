import { HttpClient } from '@angular/common/http';
import { httpParams } from '../../../core/utils/http-params.utils';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MedicalRecordApi } from '../../medical-records/api/medical-record.api';
import { MedicalRecordDTO } from '../../medical-records/models/patient-record.models';
import {
  HealthCondition,
  PaginatedPatients,
  Patient,
  PatientFilters,
  PatientFormDto,
  PatientGender,
} from '../models/patient.model';

// ─── Backend DTOs ──────────────────────────────────────────────────────────────

interface PatientApiDto {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  active: boolean;
  notes: string | null;
}

interface PatientSaveDto {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  active: boolean;
  notes: string | null;
}

interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-indexed
  size: number;
}

type MedicalContext = Pick<
  MedicalRecordDTO,
  'chronicConditions' | 'generalObservations' | 'continuousMedications'
>;

// ─── Mappers ───────────────────────────────────────────────────────────────────

const VALID_GENDERS: ReadonlySet<PatientGender> = new Set(['female', 'male', 'other']);

function toPatientGender(value: string | null | undefined): PatientGender {
  return value && VALID_GENDERS.has(value as PatientGender) ? (value as PatientGender) : 'other';
}

function toPatient(dto: PatientApiDto, record?: MedicalContext): Patient {
  const rawConditions = record?.chronicConditions ?? '';
  const healthConditions: HealthCondition[] = rawConditions
    ? (rawConditions
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean) as HealthCondition[])
    : [];

  return {
    id: dto.id,
    registrationNumber: dto.id,
    status: dto.active ? 'active' : 'inactive',
    fullName: dto.fullName ?? '',
    cpf: dto.cpf ?? '',
    birthDate: dto.birthDate ? dto.birthDate.slice(0, 10) : '',
    profession: dto.notes ?? '',
    gender: toPatientGender(undefined),
    chiefComplaint: record?.generalObservations ?? '',
    healthConditions,
    continuousMedications: record?.continuousMedications ?? '',
    phone: dto.phone ?? '',
    email: dto.email ?? '',
    address: { zipCode: '', street: '', neighborhood: '', city: '', state: '' },
  };
}

function toSaveDto(dto: PatientFormDto): PatientSaveDto {
  return {
    fullName: dto.fullName.trim(),
    cpf: dto.cpf.replace(/\D/g, ''),
    phone: dto.phone.replace(/\D/g, ''),
    email: dto.email.trim().toLowerCase(),
    birthDate: dto.birthDate,
    active: dto.status === 'active',
    notes: dto.profession.trim() || null,
  };
}

function toMedicalBody(dto: PatientFormDto) {
  return {
    chronicConditions: dto.healthConditions.length ? dto.healthConditions.join(', ') : null,
    generalObservations: dto.chiefComplaint.trim() || null,
    continuousMedications: dto.continuousMedications.trim() || null,
  };
}

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(map((res) => res.data));
}

// ─── API Service ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PatientApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly medicalRecordApi = inject(MedicalRecordApi);

  list(filters: PatientFilters = {}, page = 1): Observable<PaginatedPatients> {
    let params = httpParams().set('page', String(page - 1)).set('size', '10');

    if (filters.name?.trim()) {
      params = params.set('name', filters.name.trim());
    }
    if (filters.cpf) {
      params = params.set('cpf', filters.cpf.replace(/\D/g, ''));
    }
    if (filters.status) {
      params = params.set('active', String(filters.status === 'active'));
    }

    return unwrap(
      this.http.get<ApiResponse<PageDto<PatientApiDto>>>(`${this.base}/patients`, { params }),
    ).pipe(
      map((pg) => ({
        items: pg.content.map((dto) => toPatient(dto)),
        total: pg.totalElements,
        page: pg.number + 1,
        pageSize: pg.size,
        totalPages: pg.totalPages,
      })),
    );
  }

  getById(id: string): Observable<Patient> {
    return forkJoin({
      patient: unwrap(this.http.get<ApiResponse<PatientApiDto>>(`${this.base}/patients/${id}`)),
      record: this.medicalRecordApi.getMedicalRecord(id),
    }).pipe(map(({ patient, record }) => toPatient(patient, record)));
  }

  create(dto: PatientFormDto): Observable<Patient> {
    return unwrap(
      this.http.post<ApiResponse<PatientApiDto>>(`${this.base}/patients`, toSaveDto(dto)),
    ).pipe(
      switchMap((patient) =>
        this.medicalRecordApi
          .getMedicalRecord(patient.id)
          .pipe(
            switchMap((record) =>
              this.medicalRecordApi
                .updateMedicalRecord(record.id, toMedicalBody(dto))
                .pipe(map((updated) => toPatient(patient, updated))),
            ),
          ),
      ),
    );
  }

  update(id: string, dto: PatientFormDto): Observable<Patient> {
    return forkJoin({
      patient: unwrap(
        this.http.put<ApiResponse<PatientApiDto>>(`${this.base}/patients/${id}`, toSaveDto(dto)),
      ),
      record: this.medicalRecordApi.getMedicalRecord(id),
    }).pipe(
      switchMap(({ patient, record }) =>
        this.medicalRecordApi
          .updateMedicalRecord(record.id, { ...toMedicalBody(dto), allergies: record.allergies ?? null })
          .pipe(map((updated) => toPatient(patient, updated))),
      ),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/patients/${id}`);
  }
}
