import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMockTreatment } from '../../data/mock-treatment';
import { ProcedureFormComponent } from '../../components/procedure-form/procedure-form.component';
import { Procedure } from '../../models/treatment.model';

@Component({
  selector: 'app-edit-procedure-page',
  imports: [ProcedureFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-procedure-form
      [treatmentId]="id()"
      [patientName]="treatment().patient.name"
      [patientCode]="'ID: #PAC-' + treatment().patient.id.slice(0, 4).toUpperCase()"
      [isEdit]="true"
      [existingProcedure]="procedure()"
    />
  `,
})
export class EditProcedurePageComponent {
  private route = inject(ActivatedRoute);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected treatment = computed(() => getMockTreatment(this.id()));

  protected procedure = computed<Procedure | null>(() => {
    const procId = this.route.snapshot.queryParamMap.get('procedure');
    if (!procId) return null;
    return this.treatment().procedures.find((p) => p.id === procId) ?? null;
  });
}
