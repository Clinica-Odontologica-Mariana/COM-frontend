import {
  Procedure,
  ProcedureStatus,
  ToothState,
  TreatmentData,
} from '../../models/treatment.model';
import {
  ClinicalProcedureDto,
  MedicalRecordDto,
  OdontogramEntryDto,
  PatientDto,
  TreatmentPlanDto,
  TreatmentPlanItemDto,
} from '../dto/treatment-plan.dto';

export function adaptTreatmentData(
  plan: TreatmentPlanDto,
  items: TreatmentPlanItemDto[],
  patient: PatientDto | null,
  medicalRecord: MedicalRecordDto | null,
  odontogramEntries: OdontogramEntryDto[],
  clinicalProcs: Record<string, ClinicalProcedureDto>,
): TreatmentData {
  const procedures: Procedure[] = items.map((item) => {
    const cp = item.procedureId ? clinicalProcs[item.procedureId] : null;
    const status = fromApiStatus(item.status);
    const teeth = item.toothNumber != null ? [item.toothNumber] : [];
    return {
      id: item.id,
      name: cp?.name ?? item.description,
      type: cp?.category ?? 'Outros',
      startDate: fmtDate(item.createdAt),
      endDate: fmtDate(item.completedAt),
      value: item.estimatedPrice ?? 0,
      teeth,
      materials: [],
      status,
      subtitle: buildSubtitle(cp?.category ?? 'Outros', teeth),
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
      code: buildPatientCode(patient),
    },
    procedures,
    totalBudget,
    executed,
    toPay: totalBudget - executed,
    toothStates: buildToothStates(procedures, odontogramEntries),
    journeyStep: calcJourneyStep(procedures),
    notes: plan.notes ?? medicalRecord?.generalObservations ?? '',
  };
}

export function fromApiStatus(apiStatus: string): ProcedureStatus {
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

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function buildSubtitle(category: string, teeth: number[]): string {
  if (!teeth.length) return category;
  return `${category} — ${teeth.length} ${teeth.length === 1 ? 'dente' : 'dentes'}`;
}

function buildPatientCode(patient: PatientDto | null): string {
  if (!patient?.id) return 'PAC-000';
  return `PAC-${patient.id.replace(/-/g, '').slice(-3).toUpperCase()}`;
}

function buildToothStates(
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

function calcJourneyStep(procedures: Procedure[]): number {
  if (!procedures.length) return 0;
  const active = procedures.filter((p) => p.status !== 'interrupted');
  if (active.every((p) => p.status === 'completed')) return 2;
  if (active.some((p) => p.status === 'in_progress')) return 1;
  return 0;
}
