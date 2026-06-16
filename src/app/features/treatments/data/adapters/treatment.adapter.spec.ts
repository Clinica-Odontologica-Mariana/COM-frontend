import { describe, expect, it } from 'vitest';
import { adaptTreatmentData, fromApiStatus } from './treatment.adapter';
import {
  ClinicalProcedureDto,
  MedicalRecordDto,
  OdontogramEntryDto,
  PatientDto,
  TreatmentPlanDto,
  TreatmentPlanItemDto,
} from '../dto/treatment-plan.dto';

// ── factories ─────────────────────────────────────────────────────────────────

const makePlan = (o: Partial<TreatmentPlanDto> = {}): TreatmentPlanDto => ({
  id: 'plan-1',
  patientId: 'pat-1',
  medicalRecordId: 'rec-1',
  title: 'Plano Principal',
  status: 'ACTIVE',
  notes: 'Observação clínica',
  totalAmount: 1000,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...o,
});

const makeItem = (o: Partial<TreatmentPlanItemDto> = {}): TreatmentPlanItemDto => ({
  id: 'item-1',
  treatmentPlanId: 'plan-1',
  procedureId: null,
  toothNumber: null,
  description: 'Extração',
  estimatedPrice: 300,
  status: 'PENDING',
  sortOrder: 1,
  completedAt: null,
  createdAt: '2024-01-01T10:00:00Z',
  ...o,
});

const makePatient = (o: Partial<PatientDto> = {}): PatientDto => ({
  id: 'pat-1',
  fullName: 'Maria Silva',
  cpf: '000.000.000-00',
  phone: '61999999999',
  email: 'maria@test.com',
  ...o,
});

const makeRecord = (o: Partial<MedicalRecordDto> = {}): MedicalRecordDto => ({
  id: 'rec-1',
  patientId: 'pat-1',
  generalObservations: 'Sem intercorrências.',
  ...o,
});

const makeEntry = (o: Partial<OdontogramEntryDto> = {}): OdontogramEntryDto => ({
  id: 'entry-1',
  patientId: 'pat-1',
  toothNumber: 11,
  conditionCode: 'CARIE',
  ...o,
});

const makeClinicalProc = (o: Partial<ClinicalProcedureDto> = {}): ClinicalProcedureDto => ({
  id: 'cp-1',
  name: 'Extração de Siso',
  category: 'Cirurgia',
  ...o,
});

// ── fromApiStatus ─────────────────────────────────────────────────────────────

describe('fromApiStatus', () => {
  it('maps DONE to completed', () => {
    expect(fromApiStatus('DONE')).toBe('completed');
  });

  it('maps APPROVED to in_progress', () => {
    expect(fromApiStatus('APPROVED')).toBe('in_progress');
  });

  it('maps CANCELLED to interrupted', () => {
    expect(fromApiStatus('CANCELLED')).toBe('interrupted');
  });

  it('maps PENDING to pending', () => {
    expect(fromApiStatus('PENDING')).toBe('pending');
  });

  it('is case-insensitive', () => {
    expect(fromApiStatus('done')).toBe('completed');
    expect(fromApiStatus('approved')).toBe('in_progress');
  });

  it('maps unknown values to pending', () => {
    expect(fromApiStatus('')).toBe('pending');
    expect(fromApiStatus('WHATEVER')).toBe('pending');
  });
});

// ── adaptTreatmentData ────────────────────────────────────────────────────────

describe('adaptTreatmentData — patient mapping', () => {
  it('uses patient fullName and id when patient is provided', () => {
    const result = adaptTreatmentData(makePlan(), [], makePatient(), null, [], {});
    expect(result.patient.name).toBe('Maria Silva');
    expect(result.patient.id).toBe('pat-1');
  });

  it('falls back to plan.patientId and "Paciente" when patient is null', () => {
    const result = adaptTreatmentData(makePlan(), [], null, null, [], {});
    expect(result.patient.name).toBe('Paciente');
    expect(result.patient.id).toBe('pat-1');
  });
});

describe('adaptTreatmentData — procedure mapping', () => {
  it('uses clinical procedure name when linked procedure is provided', () => {
    const item = makeItem({ procedureId: 'cp-1' });
    const cp = makeClinicalProc({ id: 'cp-1', name: 'Extração de Siso', category: 'Cirurgia' });
    const result = adaptTreatmentData(makePlan(), [item], makePatient(), null, [], { 'cp-1': cp });

    expect(result.procedures[0].name).toBe('Extração de Siso');
    expect(result.procedures[0].type).toBe('Cirurgia');
  });

  it('falls back to item description when no clinical procedure', () => {
    const item = makeItem({ procedureId: null, description: 'Limpeza manual' });
    const result = adaptTreatmentData(makePlan(), [item], null, null, [], {});
    expect(result.procedures[0].name).toBe('Limpeza manual');
    expect(result.procedures[0].type).toBe('Outros');
  });

  it('maps item status through fromApiStatus', () => {
    const item = makeItem({ status: 'DONE' });
    const result = adaptTreatmentData(makePlan(), [item], null, null, [], {});
    expect(result.procedures[0].status).toBe('completed');
  });

  it('maps toothNumber to teeth array', () => {
    const item = makeItem({ toothNumber: 18 });
    const result = adaptTreatmentData(makePlan(), [item], null, null, [], {});
    expect(result.procedures[0].teeth).toEqual([18]);
  });

  it('sets teeth to empty array when toothNumber is null', () => {
    const item = makeItem({ toothNumber: null });
    const result = adaptTreatmentData(makePlan(), [item], null, null, [], {});
    expect(result.procedures[0].teeth).toEqual([]);
  });

  it('maps estimatedPrice to value', () => {
    const item = makeItem({ estimatedPrice: 450 });
    const result = adaptTreatmentData(makePlan(), [item], null, null, [], {});
    expect(result.procedures[0].value).toBe(450);
  });
});

describe('adaptTreatmentData — budget calculation', () => {
  it('uses plan.totalAmount when provided', () => {
    const result = adaptTreatmentData(makePlan({ totalAmount: 2000 }), [], null, null, [], {});
    expect(result.totalBudget).toBe(2000);
  });

  it('sums item prices when plan.totalAmount is null', () => {
    const items = [makeItem({ estimatedPrice: 300 }), makeItem({ id: 'item-2', estimatedPrice: 200 })];
    const result = adaptTreatmentData(makePlan({ totalAmount: null }), items, null, null, [], {});
    expect(result.totalBudget).toBe(500);
  });

  it('calculates executed as sum of completed procedure values', () => {
    const items = [
      makeItem({ id: 'i1', status: 'DONE', estimatedPrice: 300 }),
      makeItem({ id: 'i2', status: 'PENDING', estimatedPrice: 200 }),
    ];
    const result = adaptTreatmentData(makePlan({ totalAmount: 500 }), items, null, null, [], {});
    expect(result.executed).toBe(300);
  });

  it('calculates toPay as totalBudget minus executed', () => {
    const items = [
      makeItem({ id: 'i1', status: 'DONE', estimatedPrice: 300 }),
      makeItem({ id: 'i2', status: 'PENDING', estimatedPrice: 200 }),
    ];
    const result = adaptTreatmentData(makePlan({ totalAmount: 500 }), items, null, null, [], {});
    expect(result.toPay).toBe(200);
  });

  it('toPay is 0 when all procedures are completed', () => {
    const items = [makeItem({ status: 'DONE', estimatedPrice: 500 })];
    const result = adaptTreatmentData(makePlan({ totalAmount: 500 }), items, null, null, [], {});
    expect(result.toPay).toBe(0);
  });
});

describe('adaptTreatmentData — toothStates', () => {
  it('sets selected for completed procedure teeth', () => {
    const items = [makeItem({ status: 'DONE', toothNumber: 21 })];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.toothStates[21]).toBe('selected');
  });

  it('sets pending for in_progress procedure teeth', () => {
    const items = [makeItem({ status: 'APPROVED', toothNumber: 22 })];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.toothStates[22]).toBe('pending');
  });

  it('sets inactive for interrupted procedure teeth', () => {
    const items = [makeItem({ status: 'CANCELLED', toothNumber: 23 })];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.toothStates[23]).toBe('inactive');
  });

  it('sets note for pending procedure teeth', () => {
    const items = [makeItem({ status: 'PENDING', toothNumber: 24 })];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.toothStates[24]).toBe('note');
  });

  it('adds note state for odontogram entries not already covered by procedures', () => {
    const entries = [makeEntry({ toothNumber: 15 })];
    const result = adaptTreatmentData(makePlan(), [], null, null, entries, {});
    expect(result.toothStates[15]).toBe('note');
  });

  it('does not overwrite procedure state with odontogram entry state', () => {
    const items = [makeItem({ status: 'DONE', toothNumber: 11 })];
    const entries = [makeEntry({ toothNumber: 11 })];
    const result = adaptTreatmentData(makePlan(), items, null, null, entries, {});
    expect(result.toothStates[11]).toBe('selected');
  });
});

describe('adaptTreatmentData — journeyStep', () => {
  it('returns 0 when no procedures exist', () => {
    const result = adaptTreatmentData(makePlan(), [], null, null, [], {});
    expect(result.journeyStep).toBe(0);
  });

  it('returns 0 when all procedures are pending', () => {
    const items = [makeItem({ status: 'PENDING' })];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.journeyStep).toBe(0);
  });

  it('returns 1 when at least one procedure is in progress', () => {
    const items = [
      makeItem({ id: 'i1', status: 'APPROVED' }),
      makeItem({ id: 'i2', status: 'PENDING' }),
    ];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.journeyStep).toBe(1);
  });

  it('returns 2 when all active procedures are completed', () => {
    const items = [
      makeItem({ id: 'i1', status: 'DONE' }),
      makeItem({ id: 'i2', status: 'DONE' }),
    ];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.journeyStep).toBe(2);
  });

  it('ignores interrupted procedures when calculating completion', () => {
    const items = [
      makeItem({ id: 'i1', status: 'DONE' }),
      makeItem({ id: 'i2', status: 'CANCELLED' }),
    ];
    const result = adaptTreatmentData(makePlan(), items, null, null, [], {});
    expect(result.journeyStep).toBe(2);
  });
});

describe('adaptTreatmentData — notes', () => {
  it('prefers plan.notes over medicalRecord.generalObservations', () => {
    const result = adaptTreatmentData(
      makePlan({ notes: 'Nota do plano' }),
      [],
      null,
      makeRecord({ generalObservations: 'Obs prontuário' }),
      [],
      {},
    );
    expect(result.notes).toBe('Nota do plano');
  });

  it('falls back to generalObservations when plan.notes is null', () => {
    const result = adaptTreatmentData(
      makePlan({ notes: null }),
      [],
      null,
      makeRecord({ generalObservations: 'Obs prontuário' }),
      [],
      {},
    );
    expect(result.notes).toBe('Obs prontuário');
  });

  it('returns empty string when both are null', () => {
    const result = adaptTreatmentData(makePlan({ notes: null }), [], null, null, [], {});
    expect(result.notes).toBe('');
  });
});
