import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ClinicsApi } from '../../clinics/api/clinics.api';

interface PageDto<T> {
  content: T[];
}

interface WorkplaceApiDto {
  id: string;
  clinicId: string;
  name: string;
  active: boolean;
}

interface ClinicalProcedureApiDto {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface WorkplaceOption {
  id: string;
  clinicId: string;
  name: string;
}

export interface ProcedureOption {
  id: string;
  code: string;
  name: string;
}

export interface ProfessionalOption {
  id: string;
  name: string;
  specialty: string;
}

interface ProfessionalApiDto {
  id: string;
  name: string;
  specialty: string;
}

function unwrap<T>(res: ApiResponse<PageDto<T>>): T[] {
  return res.data?.content ?? [];
}

@Injectable({ providedIn: 'root' })
export class ScheduleOptionsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly clinicsApi = inject(ClinicsApi);

  listWorkplaces(): Observable<WorkplaceOption[]> {
    return this.clinicsApi.list().pipe(
      map((clinics) => clinics.filter((c) => c.active)),
      switchMap((clinics) => {
        if (clinics.length === 0) return of<WorkplaceOption[]>([]);

        const clinicId = clinics[0].id;

        return this.http
          .get<ApiResponse<WorkplaceApiDto[]>>(`${this.base}/workplaces/clinic/${clinicId}`)
          .pipe(
            map((res) =>
              (res.data ?? [])
                .filter((w) => w.active)
                .map((w) => ({ id: w.id, clinicId: w.clinicId, name: w.name })),
            ),
          );
      }),
      catchError(() => of<WorkplaceOption[]>([])),
    );
  }

  listProfessionals(): Observable<ProfessionalOption[]> {
    const params = new HttpParams().set('page', '0').set('size', '50');

    return this.http
      .get<ApiResponse<PageDto<ProfessionalApiDto>>>(`${this.base}/professionals`, { params })
      .pipe(
        map((res) =>
          unwrap<ProfessionalApiDto>(res).map((p) => ({ id: p.id, name: p.name, specialty: p.specialty })),
        ),
        catchError(() => of<ProfessionalOption[]>([])),
      );
  }

  listProcedures(): Observable<ProcedureOption[]> {
    const params = new HttpParams().set('page', '0').set('size', '100');

    return this.http
      .get<ApiResponse<PageDto<ClinicalProcedureApiDto>>>(`${this.base}/clinical-procedures`, { params })
      .pipe(
        map((res) =>
          unwrap<ClinicalProcedureApiDto>(res)
            .filter((p) => p.active)
            .map((p) => ({ id: p.id, code: p.code, name: p.name })),
        ),
        catchError(() => of<ProcedureOption[]>([])),
      );
  }
}
