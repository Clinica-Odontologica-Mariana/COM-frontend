import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

import { MedicalRecordApi } from '../api/medical-record.api';
import {
  adaptAttachments,
  adaptBalance,
  adaptLastVisit,
  adaptMedicalAlerts,
  adaptNotes,
  adaptPatient,
  adaptProcedures,
  adaptTreatmentSummary,
} from '../adapters/patient-record.adapter';
import {
  AttachmentView,
  ClinicalNoteView,
  MedicalRecordNoteCreateDTO,
  PatientRecordState,
  TreatmentPlanDTO,
  TreatmentPlanItemDTO,
} from '../models/patient-record.models';

const initialState: PatientRecordState = {
  patient: null,
  medicalRecord: null,
  alerts: [],
  treatmentSummary: null,
  lastVisit: null,
  balance: null,
  notes: [],
  attachments: [],
  procedures: [],
  loading: false,
  savingNote: false,
  uploadingAttachment: false,
  error: undefined,
};

@Injectable()
export class PatientRecordFacade {
  private readonly api = inject(MedicalRecordApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<PatientRecordState>(initialState);
  private readonly loadSubject = new Subject<string>();

  readonly patient = computed(() => this.state().patient);
  readonly medicalRecord = computed(() => this.state().medicalRecord);
  readonly alerts = computed(() => this.state().alerts);
  readonly treatmentSummary = computed(() => this.state().treatmentSummary);
  readonly lastVisit = computed(() => this.state().lastVisit);
  readonly balance = computed(() => this.state().balance);
  readonly notes = computed(() => this.state().notes);
  readonly attachments = computed(() => this.state().attachments);
  readonly procedures = computed(() => this.state().procedures);
  readonly loading = computed(() => this.state().loading);
  readonly savingNote = computed(() => this.state().savingNote);
  readonly uploadingAttachment = computed(() => this.state().uploadingAttachment);
  readonly error = computed(() => this.state().error);

  constructor() {
    this.loadSubject
      .pipe(
        switchMap((patientId) => {
          this.patchState({ loading: true, error: undefined });

          return forkJoin({
            patient: this.api.getPatient(patientId).pipe(catchError(() => of(null))),
            record: this.api.getMedicalRecord(patientId).pipe(catchError(() => of(null))),
            notes: this.api.getNotes(patientId).pipe(catchError(() => of([]))),
            attachments: this.api.getAttachments(patientId).pipe(catchError(() => of([]))),
            plans: this.api.getTreatmentPlans(patientId).pipe(catchError(() => of([]))),
          }).pipe(
            switchMap(({ patient, record, notes, attachments, plans }) => {
              const ensurePlan$ =
                plans.length === 0 && record
                  ? this.api.createTreatmentPlan(patientId, record.id).pipe(
                      map((newPlan) => [newPlan]),
                      catchError(() => of([] as TreatmentPlanDTO[])),
                    )
                  : of(plans);

              return ensurePlan$.pipe(
                switchMap((resolvedPlans) => {
                  const firstPlan: TreatmentPlanDTO | null = resolvedPlans.length ? resolvedPlans[0] : null;
                  const itemsRequest = firstPlan
                    ? this.api.getTreatmentPlanItems(firstPlan.id).pipe(catchError(() => of([])))
                    : of<TreatmentPlanItemDTO[]>([]);

                  return itemsRequest.pipe(
                    tap((items) => {
                      this.patchState({
                        patient: patient ? adaptPatient(patient) : null,
                        medicalRecord: record,
                        alerts: record ? adaptMedicalAlerts(record) : [],
                        treatmentSummary: adaptTreatmentSummary(resolvedPlans, items),
                        lastVisit: adaptLastVisit(notes),
                        balance: adaptBalance(resolvedPlans),
                        notes: adaptNotes(notes),
                        attachments: adaptAttachments(attachments),
                        procedures: adaptProcedures(items),
                        loading: false,
                      });
                    }),
                  );
                }),
              );
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  load(patientId: string): void {
    this.loadSubject.next(patientId);
  }

  createNote(patientId: string, payload: MedicalRecordNoteCreateDTO): Observable<ClinicalNoteView> {
    this.patchState({ savingNote: true, error: undefined });

    return this.api.createNote(patientId, payload).pipe(
      map((dto) => {
        const [newNote] = adaptNotes([dto]);
        this.patchState({ notes: [newNote, ...this.state().notes] });
        return newNote;
      }),
      finalize(() => this.patchState({ savingNote: false })),
    );
  }

  deleteNote(patientId: string, noteId: string): Observable<void> {
    return this.api.deleteNote(patientId, noteId).pipe(
      tap(() => {
        this.patchState({ notes: this.state().notes.filter((n) => n.id !== noteId) });
      }),
    );
  }

  deleteAttachment(patientId: string, attachmentId: string): Observable<void> {
    return this.api.deleteAttachment(patientId, attachmentId).pipe(
      tap(() => {
        this.patchState({
          attachments: this.state().attachments.filter((a) => a.id !== attachmentId),
        });
      }),
    );
  }

  addAttachment(attachment: AttachmentView): void {
    this.patchState({ attachments: [attachment, ...this.state().attachments] });
  }

  private patchState(patch: Partial<PatientRecordState>): void {
    this.state.update((s) => ({ ...s, ...patch }));
  }
}
