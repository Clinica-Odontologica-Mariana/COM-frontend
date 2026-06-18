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
                        balance: adaptBalance(resolvedPlans, items),
                        notes: adaptNotes(notes),
                        attachments: adaptAttachments(attachments),
                        procedures: adaptProcedures(items),
                        loading: false,
                      });

                      this.loadImageUrls(patientId, attachments);
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

  updateNote(patientId: string, noteId: string, payload: MedicalRecordNoteCreateDTO): Observable<ClinicalNoteView> {
    this.patchState({ savingNote: true });
    return this.api.updateNote(patientId, noteId, payload).pipe(
      map((dto) => {
        const [updated] = adaptNotes([dto]);
        this.patchState({
          notes: this.state().notes.map((n) => (n.id === noteId ? updated : n)),
        });
        return updated;
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

  uploadAttachment(patientId: string, file: File): Observable<AttachmentView> {
    this.patchState({ uploadingAttachment: true });
    return this.api.uploadAndCreateAttachment(patientId, file).pipe(
      map(({ dto, imageUrl }) => {
        const urlMap = imageUrl
          ? new Map<string, string>([[dto.storedFileId, imageUrl]])
          : new Map<string, string>();
        const [view] = adaptAttachments([dto], urlMap);
        this.patchState({ attachments: [view, ...this.state().attachments] });
        return view;
      }),
      finalize(() => this.patchState({ uploadingAttachment: false })),
    );
  }

  private loadImageUrls(patientId: string, attachments: { storedFileId: string; mimeType: string }[]): void {
    const imageAttachments = attachments.filter((a) => a.mimeType?.startsWith('image/'));
    if (!imageAttachments.length) return;

    this.api
      .getOdontogramFilesForPatient(patientId)
      .pipe(
        switchMap((odontogramFiles) => {
          const odontogramFileMap = new Map(odontogramFiles.map((f) => [f.file.id, f.id]));
          return forkJoin(
            imageAttachments.map((att) => {
              const oId = odontogramFileMap.get(att.storedFileId);
              if (!oId) return of(null as string | null);
              return this.api
                .getOdontogramFileDownloadUrl(oId)
                .pipe(catchError(() => of(null as string | null)));
            }),
          ).pipe(
            map((imageUrls) => {
              const urlMap = new Map<string, string>();
              imageAttachments.forEach((att, i) => {
                const url = imageUrls[i];
                if (url) urlMap.set(att.storedFileId, url);
              });
              return urlMap;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((urlMap) => {
        const updated = this.state().attachments.map((att) => ({
          ...att,
          imageUrl: urlMap.get(att.storedFileId) ?? att.imageUrl,
        }));
        this.patchState({ attachments: updated });
      });
  }

  private patchState(patch: Partial<PatientRecordState>): void {
    this.state.update((s) => ({ ...s, ...patch }));
  }
}
