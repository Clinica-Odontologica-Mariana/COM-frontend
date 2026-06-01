import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { MedicalRecordApi } from '../api/medical-record.api';
import {
  ClinicalEvolutionDTO,
  CreateEvolutionDTO,
  PatientRecordState,
} from '../models/patient-record.models';

const initialState: PatientRecordState = {
  patient: {
    id: 99283,
    name: 'Beatriz Oliveira Cavalcanti',
    cpf: '000.000.000-00',
    birthDate: '1961-02-18',
    active: true,
  },
  treatmentSummary: {
    progressPercentage: 85,
    currentStep: 'Concluído',
    description:
      'Fase final de reabilitação protética. Próxima etapa: Ajuste oclusal fino e polimento final.',
  },
  financial: {
    balance: 1240,
    nextDueDate: '2026-11-05',
  },
  evolutions: [
    {
      id: 1,
      title: 'Sessão de Ajuste Protetico',
      description:
        'Paciente apresenta boa cicatrização na região do elemento 24. Realizado ajuste na base da prótese removível superior para alívio de ponto de pressão em região de tuber esquerdo. Relato de melhora na mastigação lateral. Prescrito bochecho com clorexidina 0,12% por mais 3 dias.',
      createdAt: '2024-10-12T14:30:00',
      status: 'FINISHED',
      tags: ['Protese', 'Ajuste Oclusal'],
    },
    {
      id: 2,
      title: 'Exodontia Elemento 46',
      description:
        'Procedimento cirúrgico sem intercorrências. Aplicado protocolo de Odontologia Mobile com biossegurança rigorosa. Paciente cooperativa.',
      createdAt: '2024-09-28T09:15:00',
      status: 'ARCHIVED',
      tags: [],
    },
  ],
  prescriptions: [
    {
      id: 1,
      medication: 'Amoxicilina 500mg',
      dosage: '1 comprimido a cada 8h • 7 dias',
      instructions: 'Faltam 2 dias',
    },
    {
      id: 2,
      medication: 'Clorexidina 0,12%',
      dosage: 'Bochechar 15ml apos escovacao • Noturno',
      instructions: '',
    },
  ],
  procedures: [
    {
      id: 1,
      name: 'Limpeza Profunda',
      performedAt: '2024-03-01',
      professional: 'Mar, 2024',
      status: 'DONE',
    },
    {
      id: 2,
      name: 'Restauracao Resina (24)',
      performedAt: '2024-01-01',
      professional: 'Jan, 2024',
      status: 'DONE',
    },
    {
      id: 3,
      name: 'Implante (46)',
      performedAt: '2024-12-01',
      professional: 'Planejado para Dez, 2024',
      status: 'SCHEDULED',
    },
  ],
  alerts: [
    { id: 1, description: 'Alergica a Penicilina', severity: 'HIGH' },
    { id: 2, description: 'Hipertensao controlada', severity: 'HIGH' },
    { id: 3, description: 'Uso de anticoagulantes (Aspirina 100mg)', severity: 'HIGH' },
  ],
  loading: false,
  creatingEvolution: false,
};

@Injectable()
export class PatientRecordFacade {
  private readonly api = inject(MedicalRecordApi);
  private readonly state = signal<PatientRecordState>(initialState);

  readonly patient = computed(() => this.state().patient);
  readonly treatmentSummary = computed(() => this.state().treatmentSummary);
  readonly financial = computed(() => this.state().financial);
  readonly evolutions = computed(() =>
    [...this.state().evolutions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
  readonly prescriptions = computed(() => this.state().prescriptions);
  readonly procedures = computed(() => this.state().procedures);
  readonly alerts = computed(() => this.state().alerts);
  readonly loading = computed(() => this.state().loading);
  readonly creatingEvolution = computed(() => this.state().creatingEvolution);
  readonly error = computed(() => this.state().error);

  load(patientId: number): void {
    this.patchState({ loading: false, error: undefined });

    forkJoin({
      patient: this.api.getPatient(patientId),
      record: this.api.getRecord(patientId),
      evolutions: this.api.getEvolutions(patientId),
      prescriptions: this.api.getPrescriptions(patientId),
    })
      .pipe(finalize(() => this.patchState({ loading: false })))
      .subscribe({
        next: ({ patient, record, evolutions, prescriptions }) => {
          this.patchState({
            patient,
            treatmentSummary: record.treatmentSummary,
            financial: record.financial,
            alerts: record.alerts,
            procedures: record.procedures,
            evolutions,
            prescriptions,
          });
        },
        error: (error: Error) => {
          this.patchState({
            error: `Dados demonstrativos exibidos. API indisponivel: ${error.message}`,
          });
        },
      });
  }

  refresh(patientId: number): void {
    this.load(patientId);
  }

  createEvolution(payload: CreateEvolutionDTO): Observable<ClinicalEvolutionDTO> {
    this.patchState({ creatingEvolution: true, error: undefined });

    return this.api.createEvolution(payload).pipe(
      tap((evolution) => {
        this.patchState({
          evolutions: [evolution, ...this.state().evolutions],
        });
      }),
      finalize(() => this.patchState({ creatingEvolution: false })),
    );
  }

  private patchState(patch: Partial<PatientRecordState>): void {
    this.state.update((state) => ({ ...state, ...patch }));
  }
}
