import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ClinicalEvolutionsComponent, NoteEditPayload } from '../../components/clinical-evolutions/clinical-evolutions.component';
import { FinancialSummaryComponent } from '../../components/financial-summary/financial-summary.component';
import { MedicalAlertsComponent } from '../../components/medical-alerts/medical-alerts.component';
import { PatientGalleryComponent } from '../../components/patient-gallery/patient-gallery.component';
import { PatientHeaderComponent } from '../../components/patient-header/patient-header.component';
import { PrescriptionsPanelComponent } from '../../components/prescriptions-panel/prescriptions-panel.component';
import { ProceduresHistoryComponent } from '../../components/procedures-history/procedures-history.component';
import { TreatmentSummaryComponent } from '../../components/treatment-summary/treatment-summary.component';
import { CreateEvolutionComponent } from '../../dialogs/create-evolution/create-evolution.component';
import { PatientRecordFacade } from '../../facade/patient-record.facade';
import { MedicalRecordNoteCreateDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-patient-record-page',
  imports: [
    ClinicalEvolutionsComponent,
    CreateEvolutionComponent,
    FinancialSummaryComponent,
    MedicalAlertsComponent,
    PatientGalleryComponent,
    PatientHeaderComponent,
    PrescriptionsPanelComponent,
    ProceduresHistoryComponent,
    TreatmentSummaryComponent,
  ],
  providers: [PatientRecordFacade],
  template: `
    <div class="mx-auto w-full px-4 pb-16 sm:px-6" style="font-family: 'Manrope', sans-serif">
      @if (facade.error(); as err) {
        <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ err }}
        </div>
      }

      <!-- Patient header -->
      <app-patient-header [patient]="facade.patient()" />

      <hr class="border-[#F5F5F4]" />

      <!-- Bento stats row -->
      <div class="mt-10 flex flex-col gap-4 sm:flex-row sm:items-start  ">
        <!-- Treatment summary — wider card -->
        <div class="sm:flex-2">
          <app-treatment-summary [summary]="facade.treatmentSummary()" />
        </div>

        <!-- Last visit + Saldo -->
        <div class="flex flex-col gap-4 sm:flex-2">
          <app-financial-summary [balance]="facade.balance()" [lastVisit]="facade.lastVisit()" />
        </div>
      </div>

      <!-- Main content grid -->
      <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_293px]">
        <!-- Left column: evolutions + gallery -->
        <div class="space-y-14">
          <app-clinical-evolutions
            [notes]="facade.notes()"
            (newNote)="openNoteDialog()"
            (noteDeleted)="deleteNote($event)"
            (noteEdited)="editNote($event)"
          />

          <app-patient-gallery
            [patientId]="patientId()"
            [attachments]="facade.attachments()"
            [uploading]="facade.uploadingAttachment()"
            (deleted)="deleteAttachment($event)"
            (fileSelected)="uploadAttachment($event)"
          />
        </div>

        <!-- Right column: alerts + procedures + prescriptions -->
        <aside class="flex flex-col gap-6">
          <app-medical-alerts [alerts]="facade.alerts()" />
          <app-procedures-history [procedures]="facade.procedures()" [patientId]="patientId()" />
          <app-prescriptions-panel [patientId]="patientId()" />
        </aside>
      </div>
    </div>

    @if (showNoteDialog()) {
      <app-create-evolution
        [saving]="facade.savingNote()"
        (closed)="closeNoteDialog()"
        (saved)="saveNote($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRecordPageComponent implements OnInit {
  protected readonly facade = inject(PatientRecordFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly patientId = signal('');
  protected readonly showNoteDialog = signal(false);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.patientId.set(id);
      this.facade.load(id);
    });
  }

  protected openNoteDialog(): void {
    this.showNoteDialog.set(true);
  }
  protected closeNoteDialog(): void {
    this.showNoteDialog.set(false);
  }

  protected saveNote(payload: MedicalRecordNoteCreateDTO): void {
    this.facade
      .createNote(this.patientId(), payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.closeNoteDialog(), error: () => undefined });
  }

  protected editNote({ id, note }: NoteEditPayload): void {
    this.facade
      .updateNote(this.patientId(), id, { note })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }

  protected deleteNote(noteId: string): void {
    this.facade
      .deleteNote(this.patientId(), noteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected deleteAttachment(attachmentId: string): void {
    this.facade
      .deleteAttachment(this.patientId(), attachmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected uploadAttachment(file: File): void {
    this.facade
      .uploadAttachment(this.patientId(), file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }
}
