import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMockTratamento } from '../../data/mock-tratamento';
import { ProcedimentoFormComponent } from '../../components/procedimento-form/procedimento-form.component';

@Component({
  selector: 'app-cadastro-procedimento-page',
  imports: [ProcedimentoFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-procedimento-form
      [tratamentoId]="id()"
      [patientName]="tratamento().patient.nome"
      [patientCode]="tratamento().patient.codigo"
      [isEdit]="false"
      [existingProcedure]="null"
    />
  `,
})
export class CadastroProcedimentoPageComponent {
  private route = inject(ActivatedRoute);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected tratamento = computed(() => getMockTratamento(this.id()));
}
