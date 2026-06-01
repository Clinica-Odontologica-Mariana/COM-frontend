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

import { ClinicalEvolutionsComponent } from '../../components/clinical-evolutions/clinical-evolutions.component';
import { FinancialSummaryComponent } from '../../components/financial-summary/financial-summary.component';
import { MedicalAlertsComponent } from '../../components/medical-alerts/medical-alerts.component';
import { PatientHeaderComponent } from '../../components/patient-header/patient-header.component';
import { PrescriptionsPanelComponent } from '../../components/prescriptions-panel/prescriptions-panel.component';
import { ProceduresHistoryComponent } from '../../components/procedures-history/procedures-history.component';
import { TreatmentSummaryComponent } from '../../components/treatment-summary/treatment-summary.component';
import { CreateEvolutionComponent } from '../../dialogs/create-evolution/create-evolution.component';
import { PatientRecordFacade } from '../../facade/patient-record.facade';
import { CreateEvolutionDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-patient-record-page',
  imports: [
    ClinicalEvolutionsComponent,
    CreateEvolutionComponent,
    FinancialSummaryComponent,
    MedicalAlertsComponent,
    PatientHeaderComponent,
    PrescriptionsPanelComponent,
    ProceduresHistoryComponent,
    TreatmentSummaryComponent,
  ],
  providers: [PatientRecordFacade],
  template: `
    <div class="mx-auto max-w-7xl">
      <div
        class="mb-4 flex items-center justify-between rounded-lg border border-[#E4D8D1] bg-white px-4 py-3 lg:hidden"
      >
        <div>
          <p class="text-xs font-semibold uppercase text-[#A77769]">Prontuario</p>
          <p class="font-semibold text-[#3F322D]">Dra. Mariana</p>
        </div>
        <span class="rounded-lg bg-[#EFE7E3] px-3 py-2 text-sm font-semibold text-[#7B564A]">
          Menu
        </span>
      </div>

      @if (facade.error(); as error) {
        <div class="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>
      }

      <app-patient-header [patient]="facade.patient()" />

      @if (facade.loading()) {
        <div class="mt-6 grid gap-4 lg:grid-cols-12">
          <div class="h-40 animate-pulse rounded-lg bg-[#EFE7E3] lg:col-span-8"></div>
          <div class="h-40 animate-pulse rounded-lg bg-[#EFE7E3] lg:col-span-4"></div>
          <div class="h-80 animate-pulse rounded-lg bg-[#EFE7E3] lg:col-span-8"></div>
          <div class="h-80 animate-pulse rounded-lg bg-[#EFE7E3] lg:col-span-4"></div>
        </div>
      } @else {
        <div class="mt-6 grid gap-4 lg:grid-cols-12">
          <div class="space-y-8 lg:col-span-8">
            <div class="grid gap-4 xl:grid-cols-2">
              <app-treatment-summary [summary]="facade.treatmentSummary()" />
              <app-financial-summary [financial]="facade.financial()" />
            </div>

            <app-clinical-evolutions
              [evolutions]="facade.evolutions()"
              (newEvolution)="openEvolutionDialog()"
            />
          </div>

          <aside class="flex flex-col gap-4 lg:col-span-4">
            <app-medical-alerts [alerts]="facade.alerts()" />
            <app-prescriptions-panel [prescriptions]="facade.prescriptions()" />
            <app-procedures-history [procedures]="facade.procedures()" />
          </aside>
        </div>
      }

      @if (creatingEvolution()) {
        <app-create-evolution
          [patientId]="patientId()"
          [saving]="facade.creatingEvolution()"
          (closed)="closeEvolutionDialog()"
          (saved)="createEvolution($event)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRecordPageComponent implements OnInit {
  protected readonly facade = inject(PatientRecordFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly patientId = signal(0);
  protected readonly creatingEvolution = signal(false);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const patientId = Number(params.get('id'));
      this.patientId.set(patientId);
      this.facade.load(patientId);
    });
  }

  protected openEvolutionDialog(): void {
    this.creatingEvolution.set(true);
  }

  protected closeEvolutionDialog(): void {
    this.creatingEvolution.set(false);
  }

  protected createEvolution(payload: CreateEvolutionDTO): void {
    this.facade
      .createEvolution(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.closeEvolutionDialog(),
        error: () => undefined,
      });
  }
}
