import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { MedicalRecordApi } from '../api/medical-record.api';
import {
  MedicalRecordNoteDTO,
  PatientDTO,
  MedicalRecordDTO,
} from '../models/patient-record.models';
import { PatientRecordFacade } from './patient-record.facade';

const patientDto: PatientDTO = {
  id: 'p1',
  addressId: null,
  createdByUserId: 'u1',
  fullName: 'Carlos Mendes',
  cpf: '000.000.000-00',
  phone: '11999999999',
  email: 'carlos@test.com',
  birthDate: '1985-03-15',
  emergencyContactName: null,
  emergencyContactPhone: null,
  notes: null,
  active: true,
};

const recordDto: MedicalRecordDTO = {
  id: 'r1',
  patientId: 'p1',
  createdByUserId: 'u1',
  allergies: null,
  chronicConditions: null,
  continuousMedications: null,
  generalObservations: null,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const noteDto: MedicalRecordNoteDTO = {
  id: 'note1',
  medicalRecordId: 'r1',
  createdByUserId: 'u1',
  note: 'Evolução inicial do paciente.',
  createdAt: '2024-06-01T10:00:00Z',
};

const planDto = {
  id: 'plan1',
  patientId: 'p1',
  medicalRecordId: 'r1',
  professionalId: null,
  title: 'Plano',
  status: 'ACTIVE',
  notes: null,
  totalAmount: 0,
  createdByUserId: 'u1',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

function createApiMock() {
  return {
    getPatient: vi.fn().mockReturnValue(of(patientDto)),
    getMedicalRecord: vi.fn().mockReturnValue(of(recordDto)),
    getNotes: vi.fn().mockReturnValue(of([])),
    getAttachments: vi.fn().mockReturnValue(of([])),
    getTreatmentPlans: vi.fn().mockReturnValue(of([])),
    createTreatmentPlan: vi.fn().mockReturnValue(of(planDto)),
    getTreatmentPlanItems: vi.fn().mockReturnValue(of([])),
    createNote: vi.fn(),
    deleteNote: vi.fn(),
    deleteAttachment: vi.fn(),
  };
}

describe('PatientRecordFacade', () => {
  let facade: PatientRecordFacade;
  let api: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    api = createApiMock();
    TestBed.configureTestingModule({
      providers: [PatientRecordFacade, { provide: MedicalRecordApi, useValue: api }],
    });
    facade = TestBed.inject(PatientRecordFacade);
  });

  it('starts in non-loading state with null patient', () => {
    expect(facade.loading()).toBe(false);
    expect(facade.patient()).toBeNull();
    expect(facade.notes()).toEqual([]);
  });

  it('populates patient after successful load (all observables synchronous)', () => {
    // All mocks return synchronous of() — the Subject pipeline completes synchronously.
    facade.load('p1');
    expect(facade.patient()?.fullName).toBe('Carlos Mendes');
    expect(facade.patient()?.id).toBe('p1');
    expect(facade.loading()).toBe(false);
  });

  it('populates notes when API returns them', () => {
    api.getNotes.mockReturnValue(of([noteDto]));
    facade.load('p1');
    expect(facade.notes()).toHaveLength(1);
    expect(facade.notes()[0].id).toBe('note1');
  });

  it('keeps patient null when getPatient fails (catchError fallback)', () => {
    api.getPatient.mockReturnValue(throwError(() => new Error('Network error')));
    facade.load('p1');
    expect(facade.patient()).toBeNull();
    expect(facade.loading()).toBe(false);
  });

  it('loads last patient data when load() is called twice (switchMap cancels first)', () => {
    const patientA = { ...patientDto, id: 'pA', fullName: 'Paciente A' };
    const patientB = { ...patientDto, id: 'pB', fullName: 'Paciente B' };
    api.getPatient.mockReturnValueOnce(of(patientA)).mockReturnValueOnce(of(patientB));

    facade.load('pA');
    facade.load('pB');

    // With synchronous observables, both complete sequentially.
    // The last load wins.
    expect(facade.patient()?.fullName).toBe('Paciente B');
  });

  it('creates a note, prepends it to list, and returns the adapted view', () => {
    const newNoteDto = {
      ...noteDto,
      id: 'note2',
      note: 'Nova evolução.',
      createdAt: '2024-07-01T10:00:00Z',
    };
    api.getNotes.mockReturnValue(of([noteDto]));
    api.createNote.mockReturnValue(of(newNoteDto));

    facade.load('p1');
    expect(facade.notes()).toHaveLength(1);

    let emittedNote: unknown;
    facade.createNote('p1', { note: 'Nova evolução.' }).subscribe((n) => (emittedNote = n));

    expect(facade.notes()).toHaveLength(2);
    expect(facade.notes()[0].id).toBe('note2');
    expect((emittedNote as { id: string }).id).toBe('note2');
  });

  it('adapts note exactly once in createNote (no duplicate adaptNotes call)', () => {
    api.createNote.mockReturnValue(of(noteDto));
    let emitCount = 0;

    facade.createNote('p1', { note: noteDto.note }).subscribe(() => emitCount++);

    expect(emitCount).toBe(1);
    expect(facade.notes()).toHaveLength(1);
  });

  it('sets savingNote=false after createNote completes', () => {
    api.createNote.mockReturnValue(of(noteDto));
    facade.createNote('p1', { note: noteDto.note }).subscribe();
    expect(facade.savingNote()).toBe(false);
  });

  it('removes deleted note from state', () => {
    api.getNotes.mockReturnValue(of([noteDto]));
    api.deleteNote.mockReturnValue(of(undefined));

    facade.load('p1');
    expect(facade.notes()).toHaveLength(1);

    facade.deleteNote('p1', 'note1').subscribe();
    expect(facade.notes()).toHaveLength(0);
  });

  it('fetches treatment plan items for the first plan', () => {
    const plan = {
      id: 'plan1',
      patientId: 'p1',
      medicalRecordId: 'r1',
      professionalId: 'prof1',
      title: 'Plano',
      status: 'ACTIVE',
      notes: null,
      totalAmount: 500,
      createdByUserId: 'u1',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    };
    api.getTreatmentPlans.mockReturnValue(of([plan]));

    facade.load('p1');

    expect(api.getTreatmentPlanItems).toHaveBeenCalledWith('plan1');
  });
});
