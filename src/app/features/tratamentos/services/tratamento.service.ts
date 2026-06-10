import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Procedure, ProcedureStatus, ToothState, TratamentoData } from '../models/tratamento.model';
import { getMockTratamento } from '../data/mock-tratamento';

const API_BASE = 'http://localhost:8080/api/v1';

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
export class TratamentoService {
  private http = inject(HttpClient);

  getTratamento(treatmentPlanId: string): Observable<TratamentoData> {
    return forkJoin({
      plan: this.http.get<TreatmentPlanDto>(`${API_BASE}/treatment-plans/${treatmentPlanId}`),
      items: this.http.get<TreatmentPlanItemDto[]>(`${API_BASE}/treatment-plans/${treatmentPlanId}/items`),
    }).pipe(
      switchMap(({ plan, items }) => {
        const procedureIds = [...new Set(items.map(i => i.procedureId).filter((id): id is string => !!id))];

        const clinicalProcs$ = procedureIds.length > 0
          ? forkJoin(
              procedureIds.map(id =>
                this.http
                  .get<ClinicalProcedureDto>(`${API_BASE}/clinical-procedures/${id}`)
                  .pipe(catchError(() => of(null))),
              ),
            ).pipe(
              map(results => {
                const dict: Record<string, ClinicalProcedureDto> = {};
                results.forEach((p, i) => { if (p) dict[procedureIds[i]] = p; });
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
            .get<OdontogramEntryDto[]>(`${API_BASE}/odontogram-entries/by-patient/${plan.patientId}`)
            .pipe(catchError(() => of([]))),
          clinicalProcs: clinicalProcs$,
        }).pipe(
          map(({ patient, medicalRecord, odontogramEntries, clinicalProcs }) =>
            this.mapTratamentoData(plan, items, patient, medicalRecord, odontogramEntries, clinicalProcs),
          ),
        );
      }),
      catchError(() => of(getMockTratamento(treatmentPlanId))),
    );
  }

  updateObservacoes(treatmentPlanId: string, notes: string): Observable<void> {
    return this.http
      .get<TreatmentPlanDto>(`${API_BASE}/treatment-plans/${treatmentPlanId}`)
      .pipe(
        switchMap(plan =>
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

  // ── Mapping helpers ─────────────────────────────────────────────────────────

  private mapTratamentoData(
    plan: TreatmentPlanDto,
    items: TreatmentPlanItemDto[],
    patient: PatientDto | null,
    medicalRecord: MedicalRecordDto | null,
    odontogramEntries: OdontogramEntryDto[],
    clinicalProcs: Record<string, ClinicalProcedureDto>,
  ): TratamentoData {
    const procedures: Procedure[] = items.map(item => {
      const cp = item.procedureId ? clinicalProcs[item.procedureId] : null;
      const status = this.fromApiStatus(item.status);
      const teeth = item.toothNumber != null ? [item.toothNumber] : [];
      return {
        id: item.id,
        nome: cp?.name ?? item.description,
        tipo: cp?.category ?? 'Outros',
        dataInicio: this.fmtDate(item.createdAt),
        dataFim: this.fmtDate(item.completedAt),
        valor: item.estimatedPrice ?? 0,
        dentes: teeth,
        materiais: [],
        status,
        subtitulo: this.buildSubtitulo(cp?.category ?? 'Outros', teeth),
      };
    });

    const executado = procedures
      .filter(p => p.status === 'concluido')
      .reduce((sum, p) => sum + p.valor, 0);

    const totalOrcamento =
      plan.totalAmount ?? procedures.reduce((sum, p) => sum + p.valor, 0);

    return {
      id: plan.id,
      patient: {
        id: patient?.id ?? plan.patientId,
        nome: patient?.fullName ?? 'Paciente',
        codigo: this.buildPatientCode(patient),
      },
      procedures,
      totalOrcamento,
      executado,
      aPagar: totalOrcamento - executado,
      toothStates: this.buildToothStates(procedures, odontogramEntries),
      journeyStep: this.calcJourneyStep(procedures),
      observacoes: plan.notes ?? medicalRecord?.generalObservations ?? '',
    };
  }

  private fromApiStatus(apiStatus: string): ProcedureStatus {
    switch (apiStatus?.toUpperCase()) {
      case 'DONE':      return 'concluido';
      case 'APPROVED':  return 'em_andamento';
      case 'CANCELLED': return 'interrompido';
      default:          return 'pendente';
    }
  }

  private fmtDate(iso: string | null | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private buildSubtitulo(category: string, teeth: number[]): string {
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

    // Derive from treatment plan items
    for (const proc of procedures) {
      for (const tooth of proc.dentes) {
        switch (proc.status) {
          case 'em_andamento': states[tooth] = 'pending';   break;
          case 'concluido':    states[tooth] = 'selected';  break;
          case 'interrompido': states[tooth] = 'inactive';  break;
          case 'pendente':
          default:             states[tooth] = 'note';      break;
        }
      }
    }

    // Overlay odontogram entries for teeth not already covered
    for (const entry of odontogramEntries) {
      if (entry.toothNumber != null && !states[entry.toothNumber]) {
        states[entry.toothNumber] = 'note';
      }
    }

    return states;
  }

  private calcJourneyStep(procedures: Procedure[]): number {
    if (!procedures.length) return 0;
    const active = procedures.filter(p => p.status !== 'interrompido');
    if (active.every(p => p.status === 'concluido')) return 2;
    if (active.some(p => p.status === 'em_andamento')) return 1;
    return 0;
  }
}
