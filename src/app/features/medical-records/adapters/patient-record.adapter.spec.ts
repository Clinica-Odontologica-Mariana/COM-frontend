import { describe, expect, it } from 'vitest';

import {
  MedicalRecordDTO,
  MedicalRecordNoteDTO,
  PatientDTO,
  TreatmentPlanDTO,
  TreatmentPlanItemDTO,
} from '../models/patient-record.models';
import {
  adaptBalance,
  adaptLastVisit,
  adaptMedicalAlerts,
  adaptNotes,
  adaptPatient,
  adaptProcedures,
  adaptTreatmentSummary,
} from './patient-record.adapter';

const makePatient = (overrides: Partial<PatientDTO> = {}): PatientDTO => ({
  id: 'p1',
  addressId: null,
  createdByUserId: 'u1',
  fullName: 'Ana Silva',
  cpf: '000.000.000-00',
  phone: '11999999999',
  email: 'ana@test.com',
  birthDate: '1990-05-20',
  emergencyContactName: null,
  emergencyContactPhone: null,
  notes: null,
  active: true,
  ...overrides,
});

const makeRecord = (overrides: Partial<MedicalRecordDTO> = {}): MedicalRecordDTO => ({
  id: 'r1',
  patientId: 'p1',
  createdByUserId: 'u1',
  allergies: null,
  chronicConditions: null,
  continuousMedications: null,
  generalObservations: null,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

const makeNote = (overrides: Partial<MedicalRecordNoteDTO> = {}): MedicalRecordNoteDTO => ({
  id: 'n1',
  medicalRecordId: 'r1',
  createdByUserId: 'u1',
  note: 'Paciente sem queixas.',
  createdAt: '2024-06-01T10:00:00Z',
  ...overrides,
});

const makePlan = (overrides: Partial<TreatmentPlanDTO> = {}): TreatmentPlanDTO => ({
  id: 'plan1',
  patientId: 'p1',
  medicalRecordId: 'r1',
  professionalId: 'prof1',
  title: 'Plano Inicial',
  status: 'ACTIVE',
  notes: null,
  totalAmount: 500,
  createdByUserId: 'u1',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

const makeItem = (overrides: Partial<TreatmentPlanItemDTO> = {}): TreatmentPlanItemDTO => ({
  id: 'item1',
  treatmentPlanId: 'plan1',
  procedureId: 'proc1',
  toothNumber: null,
  description: 'Extração',
  estimatedPrice: 150,
  status: 'PENDING',
  sortOrder: 1,
  completedAt: null,
  createdAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

describe('adaptPatient', () => {
  it('maps all fields from DTO to view model', () => {
    const result = adaptPatient(makePatient());
    expect(result.id).toBe('p1');
    expect(result.fullName).toBe('Ana Silva');
    expect(result.active).toBe(true);
  });
});

describe('adaptMedicalAlerts', () => {
  it('returns empty array for empty record', () => {
    expect(adaptMedicalAlerts(makeRecord())).toEqual([]);
  });

  it('parses allergies with HIGH severity', () => {
    const record = makeRecord({ allergies: 'Penicilina, Dipirona' });
    const alerts = adaptMedicalAlerts(record);
    expect(alerts).toHaveLength(2);
    expect(alerts[0].severity).toBe('HIGH');
    expect(alerts[0].type).toBe('allergy');
    expect(alerts[0].description).toBe('Penicilina');
  });

  it('generates stable IDs from description content', () => {
    const record = makeRecord({ allergies: 'Penicilina' });
    const first = adaptMedicalAlerts(record);
    const second = adaptMedicalAlerts(record);
    expect(first[0].id).toBe(second[0].id);
    expect(first[0].id).toContain('allergy-penicilina');
  });

  it('generates different IDs for different descriptions', () => {
    const record = makeRecord({ allergies: 'Penicilina, Dipirona' });
    const [a, b] = adaptMedicalAlerts(record);
    expect(a.id).not.toBe(b.id);
  });

  it('parses chronic conditions with MEDIUM severity', () => {
    const record = makeRecord({ chronicConditions: 'Diabetes' });
    const alerts = adaptMedicalAlerts(record);
    expect(alerts[0].severity).toBe('MEDIUM');
    expect(alerts[0].type).toBe('condition');
  });

  it('parses medications with LOW severity', () => {
    const record = makeRecord({ continuousMedications: 'Metformina' });
    const alerts = adaptMedicalAlerts(record);
    expect(alerts[0].severity).toBe('LOW');
    expect(alerts[0].type).toBe('medication');
  });

  it('parses semicolon-separated values', () => {
    const record = makeRecord({ allergies: 'AAS; Ibuprofeno' });
    expect(adaptMedicalAlerts(record)).toHaveLength(2);
  });
});

describe('adaptNotes', () => {
  it('returns empty array for empty input', () => {
    expect(adaptNotes([])).toEqual([]);
  });

  it('sorts notes by createdAt descending', () => {
    const older = makeNote({ id: 'n1', createdAt: '2024-01-01T10:00:00Z' });
    const newer = makeNote({ id: 'n2', createdAt: '2024-06-01T10:00:00Z' });
    const result = adaptNotes([older, newer]);
    expect(result[0].id).toBe('n2');
    expect(result[1].id).toBe('n1');
  });

  it('computes title from first sentence', () => {
    const note = makeNote({ note: 'Paciente sem dor. Demais queixas resolvidas.' });
    const [result] = adaptNotes([note]);
    expect(result.title).toBe('Paciente sem dor');
  });

  it('truncates title at 55 characters', () => {
    const longNote = makeNote({ note: 'A'.repeat(60) + '. restante' });
    const [result] = adaptNotes([longNote]);
    expect(result.title.length).toBeLessThanOrEqual(55);
    expect(result.title.endsWith('…')).toBe(true);
  });
});

describe('adaptBalance', () => {
  it('returns null for empty plans', () => {
    expect(adaptBalance([], [])).toBeNull();
  });

  it('sums totalAmount across all plans', () => {
    const result = adaptBalance(
      [makePlan({ totalAmount: 300 }), makePlan({ id: 'p2', totalAmount: 200 })],
      [],
    );
    expect(result?.amount).toBe(500);
  });

  it('handles plans with null totalAmount', () => {
    const result = adaptBalance([makePlan({ totalAmount: 0 })], []);
    expect(result?.amount).toBe(0);
  });
});

describe('adaptLastVisit', () => {
  it('returns a placeholder for empty notes', () => {
    const result = adaptLastVisit([]);
    expect(result?.date).toBe('');
    expect(result?.description).toBe('Nenhuma visita registrada');
  });

  it('returns the most recent note date', () => {
    const older = makeNote({ id: 'n1', createdAt: '2024-01-01T10:00:00Z' });
    const newer = makeNote({ id: 'n2', createdAt: '2024-06-01T10:00:00Z' });
    const result = adaptLastVisit([older, newer]);
    expect(result?.date).toBe('2024-06-01T10:00:00Z');
  });

  it('truncates description at 100 chars', () => {
    const longNote = makeNote({ note: 'X'.repeat(110) });
    const result = adaptLastVisit([longNote]);
    expect(result?.description.length).toBeLessThanOrEqual(103);
    expect(result?.description.endsWith('...')).toBe(true);
  });
});

describe('adaptProcedures', () => {
  it('returns empty array for empty input', () => {
    expect(adaptProcedures([])).toEqual([]);
  });

  it('sorts by sortOrder ascending', () => {
    const i1 = makeItem({ id: 'i1', sortOrder: 2 });
    const i2 = makeItem({ id: 'i2', sortOrder: 1 });
    const result = adaptProcedures([i1, i2]);
    expect(result[0].id).toBe('i2');
    expect(result[1].id).toBe('i1');
  });

  it('maps status and estimatedPrice correctly', () => {
    const item = makeItem({
      status: 'DONE',
      estimatedPrice: 250,
      completedAt: '2024-05-01T00:00:00Z',
    });
    const [result] = adaptProcedures([item]);
    expect(result.status).toBe('DONE');
    expect(result.estimatedPrice).toBe(250);
    expect(result.completedAt).toBe('2024-05-01T00:00:00Z');
  });
});

describe('adaptTreatmentSummary', () => {
  it('returns null for empty plans', () => {
    expect(adaptTreatmentSummary([], [])).toBeNull();
  });

  it('calculates progress percentage', () => {
    const plan = makePlan();
    const items = [
      makeItem({ id: 'i1', status: 'DONE', treatmentPlanId: 'plan1' }),
      makeItem({ id: 'i2', status: 'PENDING', treatmentPlanId: 'plan1' }),
    ];
    const result = adaptTreatmentSummary([plan], items);
    expect(result?.progressPercentage).toBe(50);
  });

  it('returns 0% progress when no items are done', () => {
    const plan = makePlan();
    const items = [makeItem({ status: 'PENDING', treatmentPlanId: 'plan1' })];
    const result = adaptTreatmentSummary([plan], items);
    expect(result?.progressPercentage).toBe(0);
  });

  it('returns 0% progress when plan has no items', () => {
    const result = adaptTreatmentSummary([makePlan()], []);
    expect(result?.progressPercentage).toBe(0);
  });

  it('prefers ACTIVE plan over first plan', () => {
    const draft = makePlan({ id: 'draft', status: 'DRAFT', title: 'Rascunho' });
    const active = makePlan({ id: 'active', status: 'ACTIVE', title: 'Ativo' });
    const result = adaptTreatmentSummary([draft, active], []);
    expect(result?.currentStep).toBe('Ativo');
  });
});
