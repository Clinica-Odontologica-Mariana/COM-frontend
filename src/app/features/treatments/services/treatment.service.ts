import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Procedure, ProcedureStatus, ToothState, TreatmentData } from '../models/treatment.model';
import { getMockTreatment } from '../data/mock-treatment';

const API_BASE = '/api/v1';

// ── API DTOs ──────────────────────────────────────────────────────────────────

interface TreatmentPlanDto {
  id: string;
  patientId: string;
  medicalRecordId: string | null;
  title: string;
  status: string;
  notes: string | null;
  totalAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TreatmentPlanItemDto {
  id: string;
  treatmentPlanId: string;
  procedureId: string | null;
  toothNumber: number | null;
  description: string;
  estimatedPrice: number;
  status: string;
  sortOrder: number | null;
  completedAt: string | null;
  createdAt: string;
}

interface PatientDto {
  id: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
}

interface ClinicalProcedureDto {
  id: string;
  name: string;
  category: string;
}

interface MedicalRecordDto {
  id: string;
  patientId: string;
  generalObservations: string | null;
}

interface OdontogramEntryDto {
  id: string;
  patientId: string;
  toothNumber: number;
  conditionCode: string | null;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class TreatmentService {
  private http = inject(HttpClient);

  getTreatment(treatmentPlanId: string): Observable<TreatmentData> {
    return forkJoin({
      plan: this.http.get<TreatmentPlanDto>(`${API_BASE}/treatment-plans/${treatmentPlanId}`),
      items: this.http.get<TreatmentPlanItemDto[]>(
        `${API_BASE}/treatment-plans/${treatmentPlanId}/items`,
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
                  this.http
                    .get<ClinicalProcedureDto>(`${API_BASE}/clinical-procedures/${id}`)
                    .pipe(catchError(() => of(null))),
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
          patient: this.http
            .get<PatientDto>(`${API_BASE}/patients/${plan.patientId}`)
            .pipe(catchError(() => of(null))),
          medicalRecord: this.http
            .get<MedicalRecordDto>(`${API_BASE}/medical-records/by-patient/${plan.patientId}`)
            .pipe(catchError(() => of(null))),
          odontogramEntries: this.http
            .get<
              OdontogramEntryDto[]
            >(`${API_BASE}/odontogram-entries/by-patient/${plan.patientId}`)
            .pipe(catchError(() => of([]))),
          clinicalProcs: clinicalProcs$,
        }).pipe(
          map(({ patient, medicalRecord, odontogramEntries, clinicalProcs }) =>
            this.mapTreatmentData(
              plan,
              items,
              patient,
              medicalRecord,
              odontogramEntries,
              clinicalProcs,
            ),
          ),
        );
      }),
      catchError(() => of(getMockTreatment(treatmentPlanId))),
    );
  }

  updateNotes(treatmentPlanId: string, notes: string): Observable<void> {
    return this.http.get<TreatmentPlanDto>(`${API_BASE}/treatment-plans/${treatmentPlanId}`).pipe(
      switchMap((plan) =>
        this.http.put<void>(`${API_BASE}/treatment-plans/${treatmentPlanId}`, {
          title: plan.title,
          notes,
        }),
      ),
      catchError(() => of(undefined)),
    );
  }

  completeProcedure(itemId: string): Observable<void> {
    return this.http
      .patch<void>(`${API_BASE}/treatment-plans/items/${itemId}/complete`, {})
      .pipe(catchError(() => of(undefined)));
  }

  startProcedure(itemId: string, description: string): Observable<void> {
    return this.http
      .put<void>(`${API_BASE}/treatment-plans/items/${itemId}`, {
        status: 'APPROVED',
        description: description || ' ',
      })
      .pipe(catchError(() => of(undefined)));
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
    return this.http.post<TreatmentPlanItemDto>(`${API_BASE}/treatment-plans/${planId}/items`, {
      description: data.description,
      estimatedPrice: data.estimatedPrice ?? 0,
      status: data.status ?? 'PENDING',
      toothNumber: data.toothNumber ?? null,
    });
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
    return this.http.put<TreatmentPlanItemDto>(`${API_BASE}/treatment-plans/items/${itemId}`, {
      description: data.description,
      estimatedPrice: data.estimatedPrice ?? 0,
      status: data.status ?? 'PENDING',
      toothNumber: data.toothNumber ?? null,
    });
  }

  deleteProcedureItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/treatment-plans/items/${itemId}`);
  }

  // ── Mapping helpers ─────────────────────────────────────────────────────────

  private mapTreatmentData(
    plan: TreatmentPlanDto,
    items: TreatmentPlanItemDto[],
    patient: PatientDto | null,
    medicalRecord: MedicalRecordDto | null,
    odontogramEntries: OdontogramEntryDto[],
    clinicalProcs: Record<string, ClinicalProcedureDto>,
  ): TreatmentData {
    const procedures: Procedure[] = items.map((item) => {
      const cp = item.procedureId ? clinicalProcs[item.procedureId] : null;
      const status = this.fromApiStatus(item.status);
      const teeth = item.toothNumber != null ? [item.toothNumber] : [];
      return {
        id: item.id,
        name: cp?.name ?? item.description,
        type: cp?.category ?? 'Outros',
        startDate: this.fmtDate(item.createdAt),
        endDate: this.fmtDate(item.completedAt),
        value: item.estimatedPrice ?? 0,
        teeth,
        materials: [],
        status,
        subtitle: this.buildSubtitle(cp?.category ?? 'Outros', teeth),
      };
    });

    const executed = procedures
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.value, 0);

    const totalBudget = plan.totalAmount ?? procedures.reduce((sum, p) => sum + p.value, 0);

    return {
      id: plan.id,
      patient: {
        id: patient?.id ?? plan.patientId,
        name: patient?.fullName ?? 'Paciente',
        code: this.buildPatientCode(patient),
      },
      procedures,
      totalBudget,
      executed,
      toPay: totalBudget - executed,
      toothStates: this.buildToothStates(procedures, odontogramEntries),
      journeyStep: this.calcJourneyStep(procedures),
      notes: plan.notes ?? medicalRecord?.generalObservations ?? '',
    };
  }

  private fromApiStatus(apiStatus: string): ProcedureStatus {
    switch (apiStatus?.toUpperCase()) {
      case 'DONE':
        return 'completed';
      case 'APPROVED':
        return 'in_progress';
      case 'CANCELLED':
        return 'interrupted';
      default:
        return 'pending';
    }
  }

  private fmtDate(iso: string | null | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private buildSubtitle(category: string, teeth: number[]): string {
    if (!teeth.length) return category;
    return `${category} — ${teeth.length} ${teeth.length === 1 ? 'dente' : 'dentes'}`;
  }

  private buildPatientCode(patient: PatientDto | null): string {
    if (!patient?.id) return 'PAC-000';
    return `PAC-${patient.id.replace(/-/g, '').slice(-3).toUpperCase()}`;
  }

  private buildToothStates(
    procedures: Procedure[],
    odontogramEntries: OdontogramEntryDto[],
  ): Record<number, ToothState> {
    const states: Record<number, ToothState> = {};

    for (const proc of procedures) {
      for (const tooth of proc.teeth) {
        switch (proc.status) {
          case 'in_progress':
            states[tooth] = 'pending';
            break;
          case 'completed':
            states[tooth] = 'selected';
            break;
          case 'interrupted':
            states[tooth] = 'inactive';
            break;
          case 'pending':
          default:
            states[tooth] = 'note';
            break;
        }
      }
    }

    for (const entry of odontogramEntries) {
      if (entry.toothNumber != null && !states[entry.toothNumber]) {
        states[entry.toothNumber] = 'note';
      }
    }

    return states;
  }

  private calcJourneyStep(procedures: Procedure[]): number {
    if (!procedures.length) return 0;
    const active = procedures.filter((p) => p.status !== 'interrupted');
    if (active.every((p) => p.status === 'completed')) return 2;
    if (active.some((p) => p.status === 'in_progress')) return 1;
    return 0;
  }
}
