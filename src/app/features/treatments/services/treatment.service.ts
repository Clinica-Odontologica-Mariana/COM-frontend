import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { ProcedureStatus, TreatmentData } from '../models/treatment.model';
import { adaptTreatmentData, fromApiStatus } from '../data/adapters/treatment.adapter';
import {
  ClinicalProcedureDto,
  OdontogramEntryDto,
  PatientDto,
  TreatmentPlanDto,
  TreatmentPlanItemDto,
} from '../data/dto/treatment-plan.dto';
import { ApiResponse } from '../../../core/models/api-response.model';

const API_BASE = '/api/v1';

const API_STATUS: Record<ProcedureStatus, string> = {
  pending: 'PENDING',
  in_progress: 'APPROVED',
  completed: 'DONE',
  interrupted: 'CANCELLED',
};

interface PatientPageDto {
  content: PatientDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface TreatmentListItem {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  status: string;
  totalAmount: number | null;
  procedureCount: number;
  completedCount: number;
}

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(map((res) => res.data));
}

@Injectable({ providedIn: 'root' })
export class TreatmentService {
  private http = inject(HttpClient);

  getTreatmentList(): Observable<TreatmentListItem[]> {
    return unwrap(
      this.http.get<ApiResponse<PatientPageDto>>(`${API_BASE}/patients`, {
        params: { size: '200', page: '0' },
      }),
    ).pipe(
      switchMap((page) => {
        const patients = page.content;
        if (!patients.length) return of([]);

        return forkJoin(
          patients.map((patient) =>
            unwrap(
              this.http.get<ApiResponse<TreatmentPlanDto[]>>(
                `${API_BASE}/treatment-plans/by-patient/${patient.id}`,
              ),
            ).pipe(
              switchMap((plans) => {
                if (!plans.length) return of([] as TreatmentListItem[]);
                return forkJoin(
                  plans.map((plan) =>
                    unwrap(
                      this.http.get<ApiResponse<TreatmentPlanItemDto[]>>(
                        `${API_BASE}/treatment-plans/${plan.id}/items`,
                      ),
                    ).pipe(
                      map(
                        (items): TreatmentListItem => ({
                          id: plan.id,
                          patientId: patient.id,
                          patientName: patient.fullName,
                          title: plan.title,
                          status: plan.status,
                          totalAmount: plan.totalAmount,
                          procedureCount: items.length,
                          completedCount: items.filter(
                            (i) => fromApiStatus(i.status) === 'completed',
                          ).length,
                        }),
                      ),
                      catchError(() =>
                        of<TreatmentListItem>({
                          id: plan.id,
                          patientId: patient.id,
                          patientName: patient.fullName,
                          title: plan.title,
                          status: plan.status,
                          totalAmount: plan.totalAmount,
                          procedureCount: 0,
                          completedCount: 0,
                        }),
                      ),
                    ),
                  ),
                );
              }),
              catchError(() => of([] as TreatmentListItem[])),
            ),
          ),
        ).pipe(map((arrays) => arrays.flat()));
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  getTreatment(treatmentPlanId: string): Observable<TreatmentData> {
    return forkJoin({
      plan: unwrap(
        this.http.get<ApiResponse<TreatmentPlanDto>>(
          `${API_BASE}/treatment-plans/${treatmentPlanId}`,
        ),
      ),
      items: unwrap(
        this.http.get<ApiResponse<TreatmentPlanItemDto[]>>(
          `${API_BASE}/treatment-plans/${treatmentPlanId}/items`,
        ),
      ),
    }).pipe(
      switchMap(({ plan, items }) => {
        const procedureIds = [
          ...new Set(items.map((i) => i.procedureId).filter((id): id is string => !!id)),
        ];

        const clinicalProcs$ =
          procedureIds.length > 0
            ? forkJoin(
                procedureIds.map((id) =>
                  unwrap(
                    this.http.get<ApiResponse<ClinicalProcedureDto>>(
                      `${API_BASE}/clinical-procedures/${id}`,
                    ),
                  ).pipe(catchError(() => of(null))),
                ),
              ).pipe(
                map((results) => {
                  const dict: Record<string, ClinicalProcedureDto> = {};
                  results.forEach((p, i) => {
                    if (p) dict[procedureIds[i]] = p;
                  });
                  return dict;
                }),
              )
            : of({} as Record<string, ClinicalProcedureDto>);

        return forkJoin({
          patient: unwrap(
            this.http.get<ApiResponse<PatientDto>>(`${API_BASE}/patients/${plan.patientId}`),
          ).pipe(catchError(() => of(null))),
          medicalRecord: unwrap(
            this.http.get<ApiResponse<never>>(
              `${API_BASE}/medical-records/by-patient/${plan.patientId}`,
            ),
          ).pipe(catchError(() => of(null))),
          odontogramEntries: unwrap(
            this.http.get<ApiResponse<OdontogramEntryDto[]>>(
              `${API_BASE}/odontogram-entries/by-patient/${plan.patientId}`,
            ),
          ).pipe(catchError(() => of([]))),
          clinicalProcs: clinicalProcs$,
        }).pipe(
          map(({ patient, medicalRecord, odontogramEntries, clinicalProcs }) =>
            adaptTreatmentData(
              plan,
              items,
              patient as PatientDto | null,
              medicalRecord as never,
              odontogramEntries,
              clinicalProcs,
            ),
          ),
        );
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  updateNotes(treatmentPlanId: string, notes: string): Observable<void> {
    return unwrap(
      this.http.get<ApiResponse<TreatmentPlanDto>>(
        `${API_BASE}/treatment-plans/${treatmentPlanId}`,
      ),
    ).pipe(
      switchMap((plan) =>
        this.http.put<void>(`${API_BASE}/treatment-plans/${treatmentPlanId}`, {
          title: plan.title,
          notes,
        }),
      ),
    );
  }

  completeProcedure(itemId: string): Observable<void> {
    return this.http.patch<void>(`${API_BASE}/treatment-plans/items/${itemId}/complete`, {});
  }

  startProcedure(itemId: string, description: string): Observable<void> {
    return this.http.put<void>(`${API_BASE}/treatment-plans/items/${itemId}`, {
      status: 'APPROVED',
      description: description || ' ',
    });
  }

  createProcedureItem(
    planId: string,
    data: {
      description: string;
      estimatedPrice?: number;
      status?: string;
      toothNumber?: number;
    },
  ): Observable<TreatmentPlanItemDto> {
    return unwrap(
      this.http.post<ApiResponse<TreatmentPlanItemDto>>(
        `${API_BASE}/treatment-plans/${planId}/items`,
        {
          description: data.description,
          estimatedPrice: data.estimatedPrice ?? 0,
          status: data.status ?? API_STATUS.pending,
          toothNumber: data.toothNumber ?? null,
        },
      ),
    );
  }

  updateProcedureItem(
    itemId: string,
    data: {
      description: string;
      estimatedPrice?: number;
      status?: string;
      toothNumber?: number;
    },
  ): Observable<TreatmentPlanItemDto> {
    return unwrap(
      this.http.put<ApiResponse<TreatmentPlanItemDto>>(
        `${API_BASE}/treatment-plans/items/${itemId}`,
        {
          description: data.description,
          estimatedPrice: data.estimatedPrice ?? 0,
          status: data.status ?? API_STATUS.pending,
          toothNumber: data.toothNumber ?? null,
        },
      ),
    );
  }

  deleteProcedureItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/treatment-plans/items/${itemId}`);
  }

  getTreatmentByPatient(patientId: string): Observable<TreatmentData> {
    return unwrap(
      this.http.get<ApiResponse<TreatmentPlanDto[]>>(
        `${API_BASE}/treatment-plans/by-patient/${patientId}`,
      ),
    ).pipe(
      switchMap((plans) => {
        if (!plans.length) return throwError(() => new Error('Nenhum plano de tratamento encontrado.'));
        return this.getTreatment(plans[0].id);
      }),
    );
  }
}
