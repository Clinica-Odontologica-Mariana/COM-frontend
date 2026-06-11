import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMockTreatment } from '../../data/mock-treatment';
import { ProcedureFormComponent } from '../../components/procedure-form/procedure-form.component';

@Component({
  selector: 'app-create-procedure-page',
  imports: [ProcedureFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-procedure-form
      [treatmentId]="id()"
      [patientName]="treatment().patient.name"
      [patientCode]="'ID: #PAC-' + treatment().patient.id.slice(0, 4).toUpperCase()"
      [isEdit]="false"
      [existingProcedure]="null"
    />
  `,
})
export class CreateProcedurePageComponent {
  private route = inject(ActivatedRoute);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected treatment = computed(() => getMockTreatment(this.id()));
}
