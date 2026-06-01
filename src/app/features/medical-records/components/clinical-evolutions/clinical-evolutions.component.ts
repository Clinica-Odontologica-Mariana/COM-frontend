import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { EvolutionCardComponent } from '../evolution-card/evolution-card.component';
import { ClinicalEvolutionDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-clinical-evolutions',
  imports: [EvolutionCardComponent],
  template: `
    <section>
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-[#A77769]">Evoluções clínicas</p>
          <h2 class="text-xl font-semibold text-[#3F322D]">Histórico recente</h2>
        </div>
        <button
          type="button"
          class="rounded-lg bg-[#A77769] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7B564A] cursor-pointer"
          (click)="newEvolution.emit()"
        >
          Nova Evolução
        </button>
      </div>

      <div class="mt-4">
        @for (evolution of evolutions(); track evolution.id) {
          <div class="mb-4 last:mb-0">
            <app-evolution-card [evolution]="evolution" />
          </div>
        } @empty {
          <div
            class="rounded-lg border border-dashed border-[#D8C8BF] bg-white p-8 text-center text-sm text-[#76645B]"
          >
            Nenhuma evolução clínica registrada.
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicalEvolutionsComponent {
  readonly evolutions = input<ClinicalEvolutionDTO[]>([]);
  readonly newEvolution = output<void>();
}
