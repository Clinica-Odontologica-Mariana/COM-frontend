import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMockTratamento } from '../../data/mock-tratamento';
import { ProcedimentoFormComponent } from '../../components/procedimento-form/procedimento-form.component';
import { Procedure } from '../../models/tratamento.model';

@Component({
  selector: 'app-edicao-procedimento-page',
  imports: [ProcedimentoFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-procedimento-form
      [tratamentoId]="id()"
      [patientName]="tratamento().patient.nome"
      [patientCode]="tratamento().patient.codigo"
      [isEdit]="true"
      [existingProcedure]="procedure()"
    />
  `,
})
export class EdicaoProcedimentoPageComponent {
  private route = inject(ActivatedRoute);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected tratamento = computed(() => getMockTratamento(this.id()));

  protected procedure = computed<Procedure | null>(() => {
    const procId = this.route.snapshot.queryParamMap.get('procedimento');
    if (!procId) return null;
    return this.tratamento().procedures.find((p) => p.id === procId) ?? null;
  });
}
