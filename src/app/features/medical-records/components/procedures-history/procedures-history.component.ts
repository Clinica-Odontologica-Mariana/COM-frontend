import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ProcedureDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-procedures-history',
  imports: [DatePipe],
  template: `
    <section class="rounded-lg border border-[#E7DCD5] bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold text-[#A77769]">Procedimentos</p>

      <div class="mt-6 space-y-4">
        @for (procedure of procedures(); track procedure.id) {
          <div class="rounded-lg bg-[#FBF8F6] p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-[#3F322D]">{{ procedure.name }}</h3>
                <p class="mt-1 text-sm text-[#76645B]">{{ procedure.professional }}</p>
              </div>
              <span class="text-right text-sm text-[#76645B]">
                {{ procedure.performedAt | date: 'dd/MM/yyyy' }}
              </span>
            </div>
          </div>
        } @empty {
          <p class="rounded-lg bg-[#FBF8F6] p-4 text-sm text-[#76645B]">
            Nenhum procedimento registrado.
          </p>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProceduresHistoryComponent {
  readonly procedures = input<ProcedureDTO[]>([]);
}
